# ==========================================
# CarMatrix API — Main Entry Point with Auto-Migration & Orders
# ==========================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.routers import (
    auth_router,
    vehicle_router,
    inventory_router,
    users_router,
    sales_router,
    orders_router,
)


app = FastAPI(
    title=settings.APP_NAME,
    description="CarMatrix REST API with Role-Based Access Control (RBAC), "
                "Vehicle Storefront, Shopping Cart, Customer Purchasing, and Financial Reports.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Create tables and perform auto-migration if SQLite columns are missing."""
    Base.metadata.create_all(bind=engine)

    # Auto-migrate SQLite schema if 'status' column is missing from existing 'users' table
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result.fetchall()]
        if "status" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Approved'"))
            conn.commit()

    # Seed initial Administrator if no Admin exists
    db: Session = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            seeded_admin = User(
                name="System Administrator",
                email="admin@carmatrix.com",
                hashed_password=hash_password("Admin123!"),
                role="admin",
                status="Approved",
            )
            db.add(seeded_admin)
            db.commit()
    finally:
        db.close()


@app.get("/", tags=["Root"])
def root():
    return {
        "status": "running",
        "project": settings.APP_NAME,
    }


@app.get(f"{settings.API_PREFIX}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
    }


app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(vehicle_router, prefix=settings.API_PREFIX)
app.include_router(inventory_router, prefix=settings.API_PREFIX)
app.include_router(users_router, prefix=settings.API_PREFIX)
app.include_router(sales_router, prefix=settings.API_PREFIX)
app.include_router(orders_router, prefix=settings.API_PREFIX)
