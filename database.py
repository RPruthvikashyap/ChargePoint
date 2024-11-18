import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use the DATABASE_URL from environment variables or fallback to localhost (for local testing)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:pruthvi123@localhost:5432/ChargePoint")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
