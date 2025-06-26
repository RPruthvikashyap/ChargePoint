from fastapi import FastAPI, Request, Depends, Form, HTTPException, Query, Response
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from routers import auth, call_log
from models import User, CallLog, TeamLeader
from passlib.context import CryptContext
from fastapi import Cookie

templates = Jinja2Templates(directory="templates")
templates.env.auto_reload = True

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
Base.metadata.create_all(bind=engine)

# ✅ Insert default TLs if missing (with password = 123456)
def create_default_team_leaders():
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        default_tls = [
            {"email": "vajrala.sadiq@chargepoint.com", "password": "123456"},
            {"email": "dennis.r@chargepoint.com", "password": "123456"},
            {"email": "ragin.rajan@chargepoint.com", "password": "123456"},
            {"email": "c.joseph@chargepoint.com", "password": "123456"},
            {"email": "adam.agundez@chargepoint.com", "password": "123456"},
        ]

        for tl_data in default_tls:
            existing = db.query(TeamLeader).filter(TeamLeader.email == tl_data["email"]).first()
            if not existing:
                hashed_password = pwd_context.hash(tl_data["password"])
                new_tl = TeamLeader(name=None, email=tl_data["email"], password=hashed_password)
                db.add(new_tl)
        db.commit()
    finally:
        db.close()

create_default_team_leaders()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(call_log.router, prefix="/logs", tags=["call_log"])

@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/tl-login", response_class=HTMLResponse)
async def team_leader_login_page(request: Request):
    return templates.TemplateResponse("TL_login.html", {"request": request})

@app.post("/auth/tl-login/")
async def tl_login(
    response: Response,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    tl = db.query(TeamLeader).filter(TeamLeader.email == email).first()
    if not tl:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not pwd_context.verify(password, tl.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    resp = RedirectResponse(url="/demo.html", status_code=302)
    resp.set_cookie(key="tl_id", value=str(tl.id), httponly=True, max_age=3600)
    return resp

@app.post("/auth/tl-register/")
async def register_team_leader(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    hashed = pwd_context.hash(password)
    db.add(TeamLeader(email=email, password=hashed))
    db.commit()
    return {"message": "Team Leader registered"}

@app.get("/auth/tl-logout/")
async def tl_logout():
    response = RedirectResponse(url="/tl-login?toast=info&message=You have been logged out successfully", status_code=302)
    response.delete_cookie("tl_id")
    return response

@app.get("/call-log", response_class=HTMLResponse)
async def call_log_page(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        return RedirectResponse(url="/", status_code=302)
    try:
        user_id = int(user_id)
        user = db.query(User).filter(User.id == user_id).first()
    except ValueError:
        return RedirectResponse(url="/", status_code=302)
    if not user:
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse("Major_Beta09.html", {"request": request, "username": user.username})

@app.get("/auth/logout/")
async def logout():
    response = RedirectResponse(url="/user-login?toast=info&message=You have been logged out successfully", status_code=302)
    response.delete_cookie("user_id")
    return response

@app.get("/demo.html", response_class=HTMLResponse)
async def demo_page(request: Request, db: Session = Depends(get_db)):
    tl_id = request.cookies.get("tl_id")
    if not tl_id:
        return RedirectResponse(url="/tl-login", status_code=302)
    try:
        tl_id = int(tl_id)
        tl = db.query(TeamLeader).filter(TeamLeader.id == tl_id).first()
    except ValueError:
        return RedirectResponse(url="/tl-login", status_code=302)
    if not tl:
        return RedirectResponse(url="/tl-login", status_code=302)
    return templates.TemplateResponse("demo.html", {"request": request, "name": "Team Leader"})

@app.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    return templates.TemplateResponse("Profile.html", {"request": request})

@app.get("/success", response_class=HTMLResponse)
async def success_page(message: str = "Success"):
    return RedirectResponse(url="/call-log", status_code=302)

@app.get("/logs/team_leader_users/")
async def get_users_by_tl_email(
    request: Request,
    db: Session = Depends(get_db)
):
    tl_id = request.cookies.get("tl_id")
    if not tl_id:
        return JSONResponse(content={"message": "Team Leader authentication required"}, status_code=401)
    try:
        tl_id = int(tl_id)
    except ValueError:
        return JSONResponse(content={"message": "Invalid Team Leader cookie"}, status_code=400)
    tl = db.query(TeamLeader).filter(TeamLeader.id == tl_id).first()
    if not tl:
        return JSONResponse(content={"message": "Team Leader not found"}, status_code=404)
    users = db.query(User).filter(User.tl_email == tl.email).all()
    if not users:
        return JSONResponse(content={"message": "No users found for this Team Leader"}, status_code=404)

    response_data = []
    for user in users:
        call_logs = db.query(CallLog).filter(CallLog.user_id == user.id).all()
        response_data.append({
            "username": user.username,
            "email": user.email,
            "case_count": len(call_logs),
            "call_logs": [
                {
                    "timestamp": log.timestamp,
                    "case_number": log.case_number,
                    "call_type": log.call_type,
                    "points": log.points
                } for log in call_logs
            ]
        })
    return response_data

@app.get("/forgot-password", response_class=HTMLResponse)
async def forgot_password_page(request: Request):
    return templates.TemplateResponse("forgot_password.html", {"request": request})

@app.get("/tl-forgot-password", response_class=HTMLResponse)
async def tl_forgot_password_page(request: Request):
    return templates.TemplateResponse("TL_forgot_password.html", {"request": request})

@app.get("/logs/call-log", response_class=HTMLResponse)
async def call_log_cookie_page(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        return RedirectResponse(url="/", status_code=302)
    try:
        user_id = int(user_id)
        user = db.query(User).filter(User.id == user_id).first()
    except ValueError:
        return RedirectResponse(url="/", status_code=302)
    if not user:
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse("call_log.html", {"request": request, "username": user.username})

@app.get("/ask-me", response_class=HTMLResponse)
async def profile_page(request: Request):
    return templates.TemplateResponse("ask_me_page.html", {"request": request})

@app.get("/relay-stuck-closed", response_class=HTMLResponse)
async def profile_page(request: Request):
    return templates.TemplateResponse("relay_stuck_closed.html", {"request": request})

@app.get("/egf", response_class=HTMLResponse)
async def profile_page(request: Request):
    return templates.TemplateResponse("EGF_Complete_Question_Based_202-EF.html", {"request": request})
