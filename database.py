import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Update to fetch the DATABASE_URL from environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://chargepoint_db_user:lt0pTaCKsbNJrStedAyosNjzkpXDo6xC@dpg-cst90rl6l47c73eivml0-a/chargepoint_db"
)  # Default to the internal Render DB URL if not set in the environment.

# Create the engine
engine = create_engine(DATABASE_URL)

# Session and Base setup
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for accessing the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
