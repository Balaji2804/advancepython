from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, root_validator
from app.core.config import load_config, save_config
from app.auth.routes import get_current_user
from app.services.failover import invert_health_check, assume_role
from typing import Optional
import logging
from datetime import datetime
import boto3

# Initialize logging
logger = logging.getLogger("failover_router")
logger.setLevel(logging.INFO)

failover_router = APIRouter()

# Request models
class FailoverRequest(BaseModel):
    app_name: Optional[str] = None
    group_name: Optional[str] = None
    direction: str

    @root_validator
    def validate_failover_request(cls, values):
        app_name = values.get("app_name")
        group_name = values.get("group_name")

        if not app_name and not group_name:
            raise ValueError("Either 'app_name' or 'group_name' must be provided.")
        if app_name and group_name:
            raise ValueError("Only one of 'app_name' or 'group_name' can be provided.")
        return values


@failover_router.post("/failover")
async def failover_operation(request: FailoverRequest, user_info: dict = Depends(get_current_user)):
    """
    Unified failover endpoint for both apps and groups.
    """
    config = load_config()

    if request.app_name:
        # Perform individual app failover
        app = next((app for app in config["applications"] if app["AppName"] == request.app_name), None)
        if not app:
            raise HTTPException(status_code=404, detail=f"Application {request.app_name} not found.")

        try:
            health_check_id_east = app["HealthCheckEast"]
            role_arn = app.get("role_arn")
            current_region = await determine_current_region(health_check_id_east, role_arn)

            if current_region == request.direction:
                return {"message": f"No failover needed. {request.app_name} is already in the {current_region} region."}

            perform_failover(app, request.direction, user_info, role_arn)
            save_config(config)  # Save only for this app
            return {
                "message": f"Failover for {request.app_name} to {request.direction} completed successfully.",
                "CurrentRegion": request.direction,
                "last_updated_by": user_info["username"],
                "last_updated_on": datetime.utcnow().isoformat() + "Z"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during app failover: {str(e)}")

    if request.group_name:
        # Perform group failover
        group = next((g for g in config.get("groups", []) if g["GroupName"] == request.group_name), None)
        if not group:
            raise HTTPException(status_code=404, detail=f"Group {request.group_name} not found.")

        try:
            for app_name in group["Apps"]:
                app = next((app for app in config["applications"] if app["AppName"] == app_name), None)
                if app:
                    health_check_id_east = app["HealthCheckEast"]
                    role_arn = app.get("role_arn")
                    current_region = await determine_current_region(health_check_id_east, role_arn)

                    if current_region != request.direction:
                        perform_failover(app, request.direction, user_info, role_arn)

            save_config(config)  # Save after all group failovers
            return {"message": f"Failover for group {request.group_name} to {request.direction} completed successfully."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during group failover: {str(e)}")


async def determine_current_region(health_check_id_east: str, role_arn: Optional[str]) -> str:
    try:
        route53_client = assume_role(role_arn, "HealthCheckSession") if role_arn else boto3.client("route53")
        current_health_check = route53_client.get_health_check(HealthCheckId=health_check_id_east)
        is_east_inverted = current_health_check['HealthCheck']['HealthCheckConfig']['Inverted']
        return "west" if is_east_inverted else "east"
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error determining current region")


def perform_failover(app: dict, direction: str, user_info: dict, role_arn: Optional[str]):
    try:
        route53_client = assume_role(role_arn, "HealthCheckUpdateSession") if role_arn else boto3.client("route53")
        health_check_id_east = app["HealthCheckEast"]

        if direction == "west":
            invert_health_check(health_check_id_east, invert=True, route53_client=route53_client)
        elif direction == "east":
            invert_health_check(health_check_id_east, invert=False, route53_client=route53_client)
        else:
            raise HTTPException(status_code=400, detail="Invalid failover direction")

        app["LastUpdatedBy"] = user_info["username"]
        app["LastUpdatedOn"] = datetime.utcnow().isoformat() + "Z"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing failover for {app['AppName']}: {e}")

