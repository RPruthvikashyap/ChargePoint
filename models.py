from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String, unique=True, nullable=False)
    tl_email = Column(String, unique=True, nullable=False)

    call_logs = relationship("CallLog", back_populates="user")

class CallLog(Base):
    __tablename__ = "call_log"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=func.now())
    case_number = Column(String)
    phone_number = Column(String)
    station_name = Column(String)
    customer_name = Column(String)
    call_type = Column(String)
    sdi = Column(String)
    issue_description = Column(Text)
    points = Column(Float, default=0.0)

    user = relationship("User", back_populates="call_logs")
