from sqlalchemy.orm import Session
from models import User, CallLog
from schemas import UserCreate, CallLogEntry
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    if user.password != user.confirm_password:
        raise ValueError("Passwords do not match")

    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username,
        password=hashed_password,
        email=user.email,
        tl_email=user.tl_email,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_call_log(db: Session, entry: CallLogEntry, user_id: int):
    call_log = CallLog(**entry.dict(), user_id=user_id)
    try:
        db.add(call_log)
        db.commit()
        db.refresh(call_log)
    except Exception as e:
        db.rollback()
        raise ValueError(f"Failed to create call log entry: {e}")
    return call_log

def get_user_call_logs(db: Session, user_id: int):
    return db.query(CallLog).filter(CallLog.user_id == user_id).all()

def delete_call_log(db: Session, call_log_id: int, user_id: int) -> bool:
    call_log = db.query(CallLog).filter(CallLog.id == call_log_id, CallLog.user_id == user_id).first()
    if call_log:
        db.delete(call_log)
        db.commit()
        return True
    return False

def create_or_update_call_log(db: Session, entry: CallLogEntry, user_id: int):
    existing_log = db.query(CallLog).filter(
        CallLog.case_number == entry.case_number,
        CallLog.call_type == "FT Call",
        CallLog.user_id == user_id
    ).first()

    if existing_log:
        existing_log.issue_description += f"<br>{entry.issue_description}"
        existing_log.points = 1
        db.commit()
        db.refresh(existing_log)
        return existing_log
    else:
        call_log = CallLog(**entry.dict(), user_id=user_id)
        db.add(call_log)
        db.commit()
        db.refresh(call_log)
        return call_log

def clear_all_call_logs(db: Session, user_id: int):
    db.query(CallLog).filter(CallLog.user_id == user_id).delete()
    db.commit()
