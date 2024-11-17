from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import schemas, crud, database
from typing import List
from models import CallLog

router = APIRouter()

@router.post("/call_log/")
async def create_call_log(entry: schemas.CallLogEntry, request: Request, db: Session = Depends(database.get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    crud.create_call_log(db, entry, user_id=int(user_id))
    return {"message": "Call log entry added successfully"}

@router.get("/call_log/", response_model=List[schemas.CallLogEntry])
async def get_user_call_logs(request: Request, db: Session = Depends(database.get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    call_logs = crud.get_user_call_logs(db, user_id=int(user_id))
    return call_logs

@router.post("/call_log/update_or_create/")
async def create_or_update_call_log(entry: schemas.CallLogEntry, request: Request, db: Session = Depends(database.get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    updated_log = crud.create_or_update_call_log(db, entry, user_id=int(user_id))
    return {"message": "Call log entry processed successfully", "updated_log": updated_log}

@router.delete("/call_log/clear_all/")
async def clear_all_call_logs(request: Request, db: Session = Depends(database.get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    # Delete all call logs for the specified user
    crud.clear_all_call_logs(db, user_id=int(user_id))
    return {"message": "All call logs cleared successfully"}

@router.delete("/call_log/{call_log_id}")
async def delete_call_log(call_log_id: int, request: Request, db: Session = Depends(database.get_db)):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    # Delete the call log only if it belongs to the logged-in user
    success = crud.delete_call_log(db, call_log_id=call_log_id, user_id=int(user_id))
    if not success:
        raise HTTPException(status_code=404, detail="Call log entry not found or not authorized")
    
    return {"message": "Call log entry deleted successfully"}
