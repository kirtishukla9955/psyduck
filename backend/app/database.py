"""
Database connection setup.
Run this file's engine/session against your PostGIS Docker container.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Explicit "+psycopg2" driver: SQLAlchemy 2.1 defaults a bare "postgresql://" URL to the
# psycopg (v3) driver, which this project does not install (it installs psycopg2-binary).
# Without this, `pip install -r requirements.txt` + a fresh SQLAlchemy pulls in a driver
# mismatch and the app fails to start with "ModuleNotFoundError: No module named 'psycopg'".
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:devpass@localhost:5432/landstack"
)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency — gives each request its own DB session and closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
