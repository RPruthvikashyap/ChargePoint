import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use the internal Render database URL
DATABASE_URL = "postgresql://chargepointdb_user:PR5SEAIneA1XKwtdxIvje8aJlU9kdo9X@dpg-cth3su52ng1s739k1uug-a/chargepointdb"

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
