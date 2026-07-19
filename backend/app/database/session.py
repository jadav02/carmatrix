# ==========================================
# Database Session Dependency
# ==========================================
# This file provides a FastAPI dependency that gives each
# API request its own database session.
#
# How it works:
# 1. A request comes in.
# 2. FastAPI calls get_db() which creates a new session.
# 3. The route handler uses the session to query/update the DB.
# 4. After the response is sent, the session is closed.
#
# This pattern ensures:
# - Each request gets an isolated session (no data leaks).
# - Sessions are always closed, even if an error occurs.
# ==========================================

from collections.abc import Generator

from sqlalchemy.orm import Session

from app.database.connection import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Yields:
        Session: A SQLAlchemy database session.

    Usage in a route:
        @router.get("/vehicles")
        def get_vehicles(db: Session = Depends(get_db)):
            return db.query(Vehicle).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
