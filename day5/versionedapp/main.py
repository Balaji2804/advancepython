from fastapi import FastAPI
from fastapi_versioning import VersionedFastAPI, version

from v1 import endpoints as v1_endpoints
from v2 import endpoints as v2_endpoints

app = FastAPI()

# Register versioned routers
app.include_router(v1_endpoints.router, prefix="/v1")
app.include_router(v2_endpoints.router, prefix="/v2")
app.include_router(v2_endpoints.router, prefix="/latest")

# Common handler not tied to any version
@app.get("/status")
def get_status():
    return {"status": "API is up and running"}

# Use VersionedFastAPI to handle versioning
app = VersionedFastAPI(app, version_format='{major}', prefix_format='/api', enable_latest=True)  # Optional: Enable access to the latest version


@app.get("/")
def read_root():
    return {"message": "Welcome to the API", "versions": ["v1", "v2"]}
