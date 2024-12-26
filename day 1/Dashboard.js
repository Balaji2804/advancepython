from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
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

    @field_validator("direction")
    def validate_direction(cls, direction):
        if direction.lower() not in {"east", "west"}:
            raise ValueError("Direction must be 'east' or 'west'.")
        return direction.lower()

    @field_validator("app_name", "group_name", mode="before")
    def validate_app_or_group(cls, value, values, field):
        if field.name == "app_name" and value and values.get("group_name"):
            raise ValueError("Only one of 'app_name' or 'group_name' can be provided.")
        if field.name == "group_name" and value and values.get("app_name"):
            raise ValueError("Only one of 'app_name' or 'group_name' can be provided.")
        if not value and not values.get("app_name" if field.name == "group_name" else "group_name"):
            raise ValueError("Either 'app_name' or 'group_name' must be provided.")
        return value


@failover_router.post("/failover")
async def failover_operation(request: FailoverRequest, user_info: dict = Depends(get_current_user)):
    """
    Unified failover endpoint for both apps and groups.
    """
    config = load_config()

    if request.app_name:
        return await perform_app_failover(request.app_name, request.direction, config, user_info)

    if request.group_name:
        return await perform_group_failover(request.group_name, request.direction, config, user_info)

    raise HTTPException(status_code=400, detail="Invalid request: Provide either 'app_name' or 'group_name'.")


async def perform_app_failover(app_name: str, direction: str, config: dict, user_info: dict):
    """
    Perform failover for a single application.
    """
    app = next((app for app in config["applications"] if app["AppName"] == app_name), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_name} not found.")

    try:
        health_check_id_east = app["HealthCheckEast"]
        role_arn = app.get("role_arn")
        current_region = await determine_current_region(health_check_id_east, role_arn)

        if current_region == direction:
            return {"message": f"No failover needed. {app_name} is already in the {current_region} region."}

        await perform_failover(app, direction, user_info, role_arn)

        # Save configuration only for this app
        save_config(config)
        return {
            "message": f"Failover for {app_name} to {direction} completed successfully.",
            "CurrentRegion": direction,
            "last_updated_by": user_info["username"],
            "last_updated_on": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during app failover: {str(e)}")


async def perform_group_failover(group_name: str, direction: str, config: dict, user_info: dict):
    """
    Perform failover for all applications in a group.
    """
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

                if current_region != direction:
                    await perform_failover(app, direction, user_info, role_arn)

        # Save configuration after all group failovers
        save_config(config)
        return {"message": f"Failover for group {group_name} to {direction} completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during group failover: {str(e)}")


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


async def perform_failover(app: dict, direction: str, user_info: dict, role_arn: Optional[str]):
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

