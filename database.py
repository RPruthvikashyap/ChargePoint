import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use the internal Render database URL
DATABASE_URL = "SQLALCHEMY_DATABASE_URL = "postgresql://<user>:<password>@localhost:<forwarded_port>/<name>"

# Ensure SSL mode for Render database
if "?" in DATABASE_URL:
    DATABASE_URL += "&sslmode=require"
else:
    DATABASE_URL += "?sslmode=require"

# Create the SQLAlchemy engine with pre-ping enabled
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Ensure connection health checks
    connect_args={"connect_timeout": 10}  # Optional: Timeout for connections
)

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
