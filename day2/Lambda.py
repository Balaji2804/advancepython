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

# Initialize FastAPI
app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request Model
class FailoverRequest(BaseModel):
    region: str
    set_identifier: str

@app.get("/")
def home():
    return {"message": "Route 53 Failover API Running"}

@app.get("/list-dns")
def list_dns_records():
    """List all DNS records in the hosted zone."""
    try:
        paginator = route53.get_paginator('list_resource_record_sets')
        records = []
        for page in paginator.paginate(HostedZoneId=HOSTED_ZONE_ID):
            records.extend(page['ResourceRecordSets'])
        return {"records": records}
    except Exception as e:
        logger.error(f"Error listing DNS records: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/failover")
def failover(request: FailoverRequest):
    """Delete a DNS record from Route 53 based on region and set identifier."""
    try:
        paginator = route53.get_paginator('list_resource_record_sets')
        alias_target = None
        for page in paginator.paginate(HostedZoneId=HOSTED_ZONE_ID):
            for record in page['ResourceRecordSets']:
                if record['Name'] == DNS_NAME and record.get('SetIdentifier') == request.set_identifier:
                    alias_target = record.get('AliasTarget')
                    break
            if alias_target:
                break

        if not alias_target:
            raise HTTPException(status_code=404, detail=f"Record for {request.set_identifier} not found")

        logger.info(f"Deleting record: {request.set_identifier}, Alias Target: {alias_target}")

        change_batch = {
            "Changes": [
                {
                    "Action": "DELETE",
                    "ResourceRecordSet": {
                        "Name": DNS_NAME,
                        "Type": "A",
                        "SetIdentifier": request.set_identifier,
                        "Region": request.region,
                        "AliasTarget": alias_target
                    }
                }
            ]
        }
        response = route53.change_resource_record_sets(
            HostedZoneId=HOSTED_ZONE_ID,
            ChangeBatch=change_batch
        )
        return {"message": f"Removed {request.set_identifier} from Route 53", "response": response}
    except Exception as e:
        logger.error(f"Error during failover: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recover")
def recover(request: FailoverRequest):
    """Recover a DNS record by restoring it in Route 53."""
    try:
        paginator = route53.get_paginator('list_resource_record_sets')
        alias_target = None
        for page in paginator.paginate(HostedZoneId=HOSTED_ZONE_ID):
            for record in page['ResourceRecordSets']:
                if record['Name'] == DNS_NAME and record.get('SetIdentifier') != request.set_identifier:
                    alias_target = record.get('AliasTarget')
                    break
            if alias_target:
                break

        if not alias_target:
            raise HTTPException(status_code=404, detail="No alias target found for recovery.")

        logger.info(f"Restoring record: {request.set_identifier}, Alias Target: {alias_target}")

        change_batch = {
            "Changes": [
                {
                    "Action": "UPSERT",
                    "ResourceRecordSet": {
                        "Name": DNS_NAME,
                        "Type": "A",
                        "SetIdentifier": request.set_identifier,
                        "Region": request.region,
                        "AliasTarget": alias_target
                    }
                }
            ]
        }
        response = route53.change_resource_record_sets(
            HostedZoneId=HOSTED_ZONE_ID,
            ChangeBatch=change_batch
        )
        return {"message": f"Restored {request.set_identifier} in Route 53", "response": response}
    except Exception as e:
        logger.error(f"Error during recovery: {e}")
        raise HTTPException(status_code=500, detail=str(e))
