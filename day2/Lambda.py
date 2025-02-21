from fastapi import FastAPI, HTTPException
import boto3
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# AWS Route 53 Client
route53 = boto3.client('route53')

# Load Configuration from Environment Variables
HOSTED_ZONE_ID = os.getenv('HOSTED_ZONE_ID', 'ZXXXXXXXXXXX')  # Replace with actual Hosted Zone ID
DNS_NAME = os.getenv('DNS_NAME', 'as.prod.com')
print(HOSTED_ZONE_ID, DNS_NAME)

# Initialize FastAPI
app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request Model
class FailoverRequest(BaseModel):
    region: str  # Example: "us-east-1"
    set_identifier: str  # Example: "us-east-1"

@app.get("/")
def home():
    return {"message": "Route 53 Failover API Running"}

# API to Remove an Unhealthy Region
@app.post("/failover")
def failover(request: FailoverRequest):
    region_to_remove = request.region
    set_identifier_to_remove = request.set_identifier
    try:
        # Paginate through all records to check if the record exists
        paginator = route53.get_paginator('list_resource_record_sets')
        record_exists = False
        alias_target = None
        for page in paginator.paginate(HostedZoneId=HOSTED_ZONE_ID):
            for record in page['ResourceRecordSets']:
                if record['Name'] == DNS_NAME and record.get('SetIdentifier') == set_identifier_to_remove:
                    record_exists = True
                    alias_target = record.get('AliasTarget')
                    break
            if record_exists:
                break

        if not record_exists:
            raise HTTPException(status_code=404, detail=f"Record for {set_identifier_to_remove} not found")

        # Log the alias target
        logger.info(f"Alias target for deletion: {alias_target}")

        # Proceed to delete the record
        change_batch = {
            "Changes": [
                {
                    "Action": "DELETE",
                    "ResourceRecordSet": {
                        "Name": DNS_NAME,
                        "Type": "A",
                        "SetIdentifier": set_identifier_to_remove,
                        "Region": region_to_remove,
                        "AliasTarget": alias_target
                    }
                }
            ]
        }
        response = route53.change_resource_record_sets(
            HostedZoneId=HOSTED_ZONE_ID,
            ChangeBatch=change_batch
        )
        return {"message": f"Removed {set_identifier_to_remove} from Route 53", "response": response}
    except Exception as e:
        logger.error(f"Error during failover: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recover")
def recover(request: FailoverRequest):
    region_to_add = request.region
    set_identifier_to_add = request.set_identifier
    try:
        alias_target = {
            "HostedZoneId": "Z1UJRXOUMOOFQ8",  # Replace with actual Hosted Zone ID
            "DNSName": "d-17jv1vge0i.execute-api.us-east-1.amazonaws.com.",  # Replace with actual DNS name
            "EvaluateTargetHealth": False
        }
        change_batch = {
            "Changes": [
                {
                    "Action": "UPSERT",
                    "ResourceRecordSet": {
                        "Name": DNS_NAME,
                        "Type": "A",
                        "SetIdentifier": set_identifier_to_add,
                        "Region": region_to_add,
                        "AliasTarget": alias_target
                    }
                }
            ]
        }
        response = route53.change_resource_record_sets(
            HostedZoneId=HOSTED_ZONE_ID,
            ChangeBatch=change_batch
        )
        return {"message": f"Restored {set_identifier_to_add} in Route 53", "response": response}
    except Exception as e:
        logger.error(f"Error during recovery: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# API to List Current DNS Records
@app.get("/list-dns")
def list_dns_records():
    try:
        response = route53.list_resource_record_sets(HostedZoneId=HOSTED_ZONE_ID)
        return {"records": response['ResourceRecordSets']}
    except Exception as e:
        logger.error(f"Error listing DNS records: {e}")
        raise HTTPException(status_code=500, detail=str(e))
