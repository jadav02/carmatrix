# ==========================================
# SQLAlchemy Database Connection
# ==========================================
# This file creates the database engine and session factory.
# Every database operation in the app uses the session from here.
# ==========================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

# ==========================================
# Database Engine
# ==========================================
# The engine is the starting point for any SQLAlchemy application.
# It manages the connection pool to the database.
#
# connect_args={"check_same_thread": False}
# This is required ONLY for SQLite because SQLite restricts
# connections to the same thread by default. FastAPI uses
# multiple threads, so we disable this check.
# ==========================================
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.DEBUG,  # Log SQL queries when DEBUG is True
)

# ==========================================
# Session Factory
# ==========================================
# A session is a "workspace" for database operations.
# - autocommit=False: We manually commit transactions.
# - autoflush=False: We manually flush changes to the database.
# - bind=engine: This session uses our engine above.
#
# SessionLocal is a factory — calling SessionLocal() creates
# a new session instance each time.
# ==========================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
