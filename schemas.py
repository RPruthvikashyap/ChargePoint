from pydantic import BaseModel, validator, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    confirm_password: str
    email: EmailStr
    tl_email: EmailStr

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    tl_email: str

    class Config:
        orm_mode = True 

class CallLogEntry(BaseModel):
    id: Optional[int] = None  
    timestamp: Optional[str]  
    case_number: str
    phone_number: str
    station_name: str
    customer_name: str
    call_type: str
    sdi: Optional[str]
    issue_description: Optional[str]
    points: float = 0.0

    @validator("timestamp", pre=True, always=True)
    def format_timestamp(cls, value):
        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d %H:%M:%S")  
        return value

    class Config:
        orm_mode = True  
        from_attributes = True