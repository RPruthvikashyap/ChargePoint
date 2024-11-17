from fastapi import APIRouter, HTTPException, Depends, Form, Request
from fastapi.responses import RedirectResponse
from fastapi import status
from sqlalchemy.orm import Session
from schemas import UserCreate
from crud import get_user_by_username, create_user
from models import User
from database import get_db
from passlib.context import CryptContext
import logging

logging.basicConfig(level=logging.INFO)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

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
    user = UserCreate(
        username=username,
        password=password,
        confirm_password=confirm_password,
        email=email,
        tl_email=tl_email,
    )
    create_user(db, user)
    response = RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)
    return response


@router.post("/login/")
async def login_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    db_user = get_user_by_username(db, username)
    if not db_user or not pwd_context.verify(password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    response = RedirectResponse(url="/call-log", status_code=status.HTTP_302_FOUND)
    response.set_cookie(key="user_id", value=str(db_user.id), httponly=True, max_age=3600)
    return response

@router.get("/logout/")
async def logout_user():
    response = RedirectResponse(url="/")
    response.delete_cookie("user_id")
    return response

@router.get("/current_user/")
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.cookies.get("user_id")
    if not user_id:
        logging.error("User ID cookie not found.")
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        logging.error(f"User with ID {user_id} not found in database.")
        raise HTTPException(status_code=404, detail="User not found")
    
    logging.info(f"Current user is {db_user.username}")
    return {
        "username": db_user.username,
        "tl_email": db_user.tl_email,
    }
