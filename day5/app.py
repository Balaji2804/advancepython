import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from fastapi import FastAPI,Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from itsdangerous import BadSignature
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from the .env file
load_dotenv()

# Import routes only after loading environment variables
from app.auth.routes import auth_router, get_current_user, serializer
from app.failover.routes import failover_router  #
from app.onboard.routes import onboard_router

app = FastAPI()

origins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8000',
    "http://127.0.0.1:8080",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# Include Routers
app.include_router(auth_router, prefix="/auth")
app.include_router(failover_router, prefix="/failover")
app.include_router(onboard_router, prefix="/onboard")

# # Mount static files
# app.mount("/static", StaticFiles(directory="static"), name="static")
#
# # Set up Jinja2 templates
# templates = Jinja2Templates(directory="templates")
# # Mount static files from the React build directory
app.mount("/", StaticFiles(directory="../my-resiliencyapp/build", html=True), name="react")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    user_info_cookie = request.cookies.get("user_info")
    if user_info_cookie:
        try:
            user_info = serializer.loads(user_info_cookie)
            return HTMLResponse(open("../my-resiliencyapp/build/index.html").read())
            # return templates.TemplateResponse("dashboard.html", {"request": request, "user_info": user_info})
        except BadSignature:
            return RedirectResponse("/signin")
    # return templates.TemplateResponse("login.html", {"request": request})
    return HTMLResponse(open("../my-resiliencyapp/build/index.html").read())

# AWS Lambda handler for deployment using

# AWS Lambda handler for deployment using Mangum
handler = Mangum(app)
