from fastapi import FastAPI, HTTPException
import boto3
from pydantic import BaseModel
import os

# AWS Route 53 Client
route53 = boto3.client('route53')

# Load Configuration from Environment Variables
HOSTED_ZONE_ID = os.getenv('HOSTED_ZONE_ID', 'ZXXXXXXXXXXX')  # Replace with actual Hosted Zone ID
DNS_NAME = os.getenv('DNS_NAME', 'as.prod.com')

# Initialize FastAPI
app = FastAPI()

# Request Model
class FailoverRequest(BaseModel):
    region: str  # Example: "as.prodeast.com"

@app.get("/")
def home():
    return {"message": "Route 53 Failover API Running"}

# API to Remove an Unhealthy Region
@app.post("/failover")
def failover(request: FailoverRequest):
    region_to_remove = request.region
    try:
        change_batch = {
            "Changes": [
                {
                    "Action": "DELETE",
                    "ResourceRecordSet": {
                        "Name": region_to_remove,
                        "Type": "CNAME",
                        "TTL": 60,
                        "ResourceRecords": [{"Value": DNS_NAME}]
                    }
                }
            ]
        }
        response = route53.change_resource_record_sets(
            HostedZoneId=HOSTED_ZONE_ID,
            ChangeBatch=change_batch
        )
        return {"message": f"Removed {region_to_remove} from Route 53", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API to Restore a Healthy Region
@app.post("/recover")
def recover(request: FailoverRequest):
    region_to_add = request.region
    try:
        change_batch = {
            "Changes": [
                {
                    "Action": "UPSERT",
                    "ResourceRecordSet": {
                        "Name": region_to_add,
                        "Type": "CNAME",
                        "TTL": 60,
                        "ResourceRecords": [{"Value": DNS_NAME}]
                    }
                }
            ]
        }
        response = route53.change_resource_record_sets(
            HostedZoneId=HOSTED_ZONE_ID,
            ChangeBatch=change_batch
        )
        return {"message": f"Restored {region_to_add} in Route 53", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API to List Current DNS Records
@app.get("/list-dns")
def list_dns_records():
    try:
        response = route53.list_resource_record_sets(HostedZoneId=HOSTED_ZONE_ID)
        return {"records": response['ResourceRecordSets']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
