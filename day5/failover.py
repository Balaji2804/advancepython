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
    app_name: str
    direction: str

class FailoverGroupRequest(BaseModel):
    group_name: str
    direction: str

class FailoverAllRequest(BaseModel):
    direction: str


@failover_router.get("/config")
async def get_failover_config(user_info: dict = Depends(get_current_user)):
    """
    Get the configuration and real-time health check statuses.
    """
    config = load_config()

    # Update health check statuses for each application
    for app in config["applications"]:
        health_check_id_east = app["HealthCheckEast"]
        role_arn = app.get("role_arn", None)

        try:
            # Use assumed role if role_arn is provided, else use default AWS credentials
            route53_client = assume_role(role_arn, "HealthCheckSession") if role_arn else boto3.client("route53")

            # Get the current health check configuration and update CurrentRegion
            current_health_check = route53_client.get_health_check(HealthCheckId=health_check_id_east)
            is_east_inverted = current_health_check['HealthCheck']['HealthCheckConfig']['Inverted']
            app["CurrentRegion"] = "west" if is_east_inverted else "east"
            logger.info(f"App {app['AppName']} is currently active in {app['CurrentRegion']}")
        except Exception as e:
            logger.error(f"Error retrieving health check status for {app['AppName']}: {e}")

    return config


@failover_router.post("/app")
async def failover_app(request: FailoverRequest, user_info: dict = Depends(get_current_user)):
    """
    Perform failover for a single application.
    """
    config = load_config()
    app_name = request.app_name
    direction = request.direction

    # Fetch the current application configuration
    app = next((app for app in config["applications"] if app["AppName"] == app_name), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_name} not found.")

    health_check_id_east = app["HealthCheckEast"]
    role_arn = app.get("role_arn")

    try:
        # Determine the current region and initiate failover if required
        current_region = await determine_current_region(health_check_id_east, role_arn)
        if current_region == direction:
            return {"message": f"No failover needed. {app_name} is already in the {current_region} region."}

        # Perform synchronous failover operation
        perform_failover(app, direction, user_info, role_arn)
        return {
            "message": f"Failover for {app_name} to {direction} completed successfully.",
            "CurrentRegion": direction,
            "last_updated_by": user_info["username"],
            "last_updated_on": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@failover_router.post("/group")
async def failover_group(request: FailoverGroupRequest, user_info: dict = Depends(get_current_user)):
    """
    Perform failover for all applications in a group.
    """
    config = load_config()
    group_name = request.group_name
    direction = request.direction

    group = next((g for g in config.get("groups", []) if g["GroupName"] == group_name), None)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    for app_name in group["Apps"]:
        await failover_app(FailoverRequest(app_name=app_name, direction=direction), user_info)

    save_config(config)
    return {"message": f"Failover for group {group_name} to {direction} completed successfully."}


@failover_router.post("/all")
async def failover_all(request: FailoverAllRequest, user_info: dict = Depends(get_current_user)):
    """
    Perform failover for all applications.
    """
    config = load_config()
    direction = request.direction

    for app in config.get("applications", []):
        await failover_app(FailoverRequest(app_name=app["AppName"], direction=direction), user_info)

    save_config(config)
    return {"message": "Failover for all applications completed successfully."}


@failover_router.get("/teams")
async def get_teams(user_info: dict = Depends(get_current_user)):
    """
    Fetch all unique teams from the config.
    """
    config = load_config()
    teams = list({app["TeamName"] for app in config["applications"]})
    return {"teams": teams}


@failover_router.get("/applications/{team_name}")
async def get_team_details(team_name: str):
    config = load_config()
    applications = [app for app in config["applications"] if app["TeamName"] == team_name]
    groups = [group for group in config["groups"] if any(app in group["Apps"] for app in [a["AppName"] for a in applications])]

    if not applications and not groups:
        raise HTTPException(status_code=404, detail=f"No applications or groups found for team: {team_name}")

    return {"applications": applications, "groups": groups}


async def determine_current_region(health_check_id_east: str, role_arn: Optional[str]) -> str:
    """
    Helper function to determine the current region of the application.
    """
    try:
        # Use assumed role if `role_arn` is provided, else use default AWS credentials
        route53_client = assume_role(role_arn, "HealthCheckSession") if role_arn else boto3.client("route53")
        current_health_check = route53_client.get_health_check(HealthCheckId=health_check_id_east)
        is_east_inverted = current_health_check['HealthCheck']['HealthCheckConfig']['Inverted']
        return "west" if is_east_inverted else "east"
    except Exception as e:
        logger.error(f"Error determining current region: {e}")
        raise HTTPException(status_code=500, detail="Error determining current region")


def perform_failover(app: dict, direction: str, user_info: dict, role_arn: Optional[str]):
    """
    Synchronous function to perform the failover operation.
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

        # Update app details post-failover
        app["LastUpdatedBy"] = user_info["username"]
        app["LastUpdatedOn"] = datetime.utcnow().isoformat() + "Z"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing failover for {app['AppName']}: {e}")
