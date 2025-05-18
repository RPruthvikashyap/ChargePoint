from fastapi import APIRouter, HTTPException, Depends, Form, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi import status
from sqlalchemy.orm import Session
from schemas import UserCreate
from crud import get_user_by_username, create_user
from models import User, TeamLeader
from database import get_db
from passlib.context import CryptContext
from fastapi.templating import Jinja2Templates
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

# Initialize Jinja2Templates
templates = Jinja2Templates(directory="templates")

# ✅ Fix Registration - Redirect after success
@router.post("/register/")
async def register_user(
    username: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    email: str = Form(...),
    tl_email: str = Form(...),
    db: Session = Depends(get_db),
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already registered")

    user = UserCreate(username=username, password=password, confirm_password=confirm_password, email=email, tl_email=tl_email)

    result = create_user(db, user)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return RedirectResponse(url="/success?message=Registration Successful", status_code=status.HTTP_302_FOUND)

# ✅ Fix Login - Redirect after success
@router.post("/login/")
async def login_user(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    response = RedirectResponse(url="/success?message=Login Successful", status_code=status.HTTP_302_FOUND)
    response.set_cookie(key="user_id", value=str(db_user.id), httponly=True, max_age=3600)
    return response

# ✅ Fixed Logout
@router.get("/logout/")
async def logout_user():
    response = RedirectResponse(url="/?toast=info&message=You have been logged out successfully", status_code=status.HTTP_302_FOUND)
    response.delete_cookie("user_id")
    return response

# ✅ Get Current User Data (Fixed `user_id` conversion)
@router.get("/current_user/")
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        logging.error("User ID cookie not found.")
        raise HTTPException(status_code=401, detail="User not authenticated")

    try:
        user_id = int(user_id)
        db_user = db.query(User).filter(User.id == user_id).first()
    except ValueError:
        logging.error("Invalid user_id format in cookie.")
        raise HTTPException(status_code=401, detail="User authentication failed")

    if not db_user:
        logging.error(f"User with ID {user_id} not found in database.")
        raise HTTPException(status_code=404, detail="User not found")

    logging.info(f"Current user is {db_user.username}")
    return {"username": db_user.username, "email": db_user.email, "tl_email": db_user.tl_email}

# ✅ Get Profile Data (Fixed `user_id` conversion)
@router.get("/profile/")
async def get_user_profile(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    try:
        user_id = int(user_id)
        db_user = db.query(User).filter(User.id == user_id).first()
    except ValueError:
        raise HTTPException(status_code=401, detail="User authentication failed")

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"username": db_user.username, "email": db_user.email, "tl_email": db_user.tl_email}

# ✅ Update Profile Data (Fixed `user_id` conversion)
@router.put("/profile/")
async def update_user_profile(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    try:
        user_id = int(user_id)
        db_user = db.query(User).filter(User.id == user_id).first()
    except ValueError:
        raise HTTPException(status_code=401, detail="User authentication failed")

    if not db_user:
        return {"status": "error", "message": "User not found"}

    data = await request.json()
    username = data.get("username")
    email = data.get("email")
    tl_email = data.get("tl_email")
    password = data.get("password", None)

    if not username or not email or not tl_email:
        return {"status": "error", "message": "Missing required fields"}

    db_user.username = username
    db_user.email = email
    db_user.tl_email = tl_email
    if password:
        db_user.password = pwd_context.hash(password)

    db.commit()

    return {"status": "success", "message": "Profile updated successfully"}

# ✅ Fixed Forgot Password Page Route (Using `TemplateResponse`)
@router.get("/forgot-password/", response_class=HTMLResponse)
async def forgot_password_page(request: Request):
    return templates.TemplateResponse("forgot_password.html", {"request": request})

# ✅ Fixed Forgot Password Logic
@router.post("/forgot-password/")
async def forgot_password(
    email: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...),
    db: Session = Depends(get_db),
):
    if new_password != confirm_password:
        return RedirectResponse(url="/forgot-password?message=Passwords do not match", status_code=status.HTTP_302_FOUND)

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return RedirectResponse(url="/forgot-password?message=Email not found", status_code=status.HTTP_302_FOUND)

    user.password = pwd_context.hash(new_password)
    db.commit()

    return RedirectResponse(url="/?message=Password reset successfully", status_code=status.HTTP_302_FOUND)

# ✅ Fixed Forgot Password Page Route (Using `TemplateResponse`)
@router.get("/tl-forgot-password/", response_class=HTMLResponse)
async def forgot_password_page(request: Request):
    return templates.TemplateResponse("TL_forgot_password.html", {"request": request})

# ✅ Fixed Forgot Password Logic
@router.post("/tl-forgot-password/")
async def forgot_password(
    email: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...),
    db: Session = Depends(get_db),
):
    if new_password != confirm_password:
        return RedirectResponse(url="/forgot-password?message=Passwords do not match", status_code=status.HTTP_302_FOUND)

    user = db.query(TeamLeader).filter(TeamLeader.email == email).first()
    if not user:
        return RedirectResponse(url="/forgot-password?message=Email not found", status_code=status.HTTP_302_FOUND)

    user.password = pwd_context.hash(new_password)
    db.commit()

    return RedirectResponse(url="/tl-login?message=Password reset successfully", status_code=status.HTTP_302_FOUND)
