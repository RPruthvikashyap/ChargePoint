from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection string
DATABASE_URL = "postgresql://postgres:root@localhost:5432/postgres"
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False  # Set to True to log SQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
