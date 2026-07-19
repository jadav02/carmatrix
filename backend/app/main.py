# ==========================================
# CarMatrix API — Main Entry Point with Auto-Migration & Luxury Vehicle Pricing
# ==========================================

import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.vehicle import Vehicle
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
    """Create tables, perform auto-migration, and ensure car prices are above 10,00,00,000 (10 Crores INR)."""
    Base.metadata.create_all(bind=engine)

    # Auto-migrate SQLite schema if 'status' column is missing from existing 'users' table
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result.fetchall()]
        if "status" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Approved'"))
            conn.commit()

    db: Session = SessionLocal()
    try:
        # Seed initial Administrator if no Admin exists
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

        # Update all car prices to be above 100,000,000 INR (10 Crores+)
        vehicles = db.query(Vehicle).all()
        base_prices = [125000000.0, 185000000.0, 240000000.0, 310000000.0, 145000000.0, 220000000.0, 295000000.0]
        for idx, v in enumerate(vehicles):
            if v.price < 100000000.0:
                random_price = base_prices[idx % len(base_prices)] + (random.randint(1, 50) * 1000000.0)
                v.price = random_price
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
