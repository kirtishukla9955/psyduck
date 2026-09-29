"""
Database connection setup.
Supports production PostgreSQL/PostGIS and local development SQLite fallback.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")

import logging
logger = logging.getLogger(__name__)

db_url_env = os.getenv("DATABASE_URL")
if db_url_env:
    DATABASE_URL = db_url_env
    print(f"[INFO] Using DATABASE_URL from environment.")
else:
    DATABASE_URL = "postgresql://postgres:devpass@localhost:5432/landstack"
    print(f"[WARNING] DATABASE_URL environment variable is NOT set. Falling back to default: {DATABASE_URL}")

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite:///"):
        sqlite_subpath = DATABASE_URL[len("sqlite:///"):]
        p = Path(sqlite_subpath)
        if not p.is_absolute():
            resolved = (backend_dir / p).resolve()
            DATABASE_URL = f"sqlite:///{resolved.as_posix()}"

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency – gives each request its own DB session and closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
