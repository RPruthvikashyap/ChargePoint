from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from routers import auth, call_log
from models import User

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI()

# Mount the static directory for serving static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize the Jinja2Templates with the templates directory
templates = Jinja2Templates(directory="templates")

# Include authentication and call log routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(call_log.router, prefix="/logs", tags=["call_log"])

# Route to serve the login page
@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# Route to serve the call log page, embedding the username in the HTML
@app.get("/call-log", response_class=HTMLResponse)
async def call_log_page(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    
    # Fetch user from the database based on the user_id
    user = db.query(User).filter(User.id == user_id).first()
    username = user.username if user else "Guest"
    
    # Pass the username to the HTML template
    return templates.TemplateResponse("Major_Beta09.html", {"request": request, "username": username})
