from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
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

# Create the router for failover operations
failover_router = APIRouter()

# Request models
class FailoverRequest(BaseModel):
    app_name: Optional[str] = None  # Optional for group failover
    group_name: Optional[str] = None  # Optional for app failover
    direction: str

@failover_router.post("/failover")
async def failover_operation(request: FailoverRequest, user_info: dict = Depends(get_current_user)):
    """
    Unified failover endpoint for both apps and groups.
    """
    config = load_config()

    # Check if request is for app or group
    if request.app_name:
        # Individual app failover
        app_name = request.app_name
        app = next((app for app in config["applications"] if app["AppName"] == app_name), None)
        if not app:
            raise HTTPException(status_code=404, detail=f"Application {app_name} not found.")

        try:
            health_check_id_east = app["HealthCheckEast"]
            role_arn = app.get("role_arn")
            current_region = await determine_current_region(health_check_id_east, role_arn)

            if current_region == request.direction:
                return {"message": f"No failover needed. {app_name} is already in the {current_region} region."}

            perform_failover(app, request.direction, user_info, role_arn)
            save_config(config)  # Save only for this app
            return {
                "message": f"Failover for {app_name} to {request.direction} completed successfully.",
                "CurrentRegion": request.direction,
                "last_updated_by": user_info["username"],
                "last_updated_on": datetime.utcnow().isoformat() + "Z"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during app failover: {str(e)}")

    elif request.group_name:
        # Group failover
        group_name = request.group_name
        group = next((g for g in config.get("groups", []) if g["GroupName"] == group_name), None)
        if not group:
            raise HTTPException(status_code=404, detail=f"Group {group_name} not found.")

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
            return {"message": f"Failover for group {group_name} to {request.direction} completed successfully."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during group failover: {str(e)}")

    else:
        raise HTTPException(status_code=400, detail="Either app_name or group_name must be provided.")

async def determine_current_region(health_check_id_east: str, role_arn: Optional[str]) -> str:
    """
    Determine the current region of the application.
    """
    try:
        route53_client = assume_role(role_arn, "HealthCheckSession") if role_arn else boto3.client("route53")
        current_health_check = route53_client.get_health_check(HealthCheckId=health_check_id_east)
        is_east_inverted = current_health_check['HealthCheck']['HealthCheckConfig']['Inverted']
        return "west" if is_east_inverted else "east"
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error determining current region")

def perform_failover(app: dict, direction: str, user_info: dict, role_arn: Optional[str]):
    """
    Perform the failover operation for an app.
    """
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
