# ==========================================
# CarMatrix API — Main Entry Point with Auto-Migration & Car Image URLs
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
                "Vehicle Storefront, Shopping Cart, Customer Purchasing, UPI QR Payments, and Financial Reports.",
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

SAMPLE_CAR_IMAGES = [
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=80", # Toyota Sedan
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80", # SUV
    "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=600&auto=format&fit=crop&q=80", # Civic / Sedan
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80", # Tesla / EV
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=80", # Porsche / Supercar
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80", # Mercedes / Luxury
]

@app.on_event("startup")
def on_startup():
    """Create tables, perform auto-migration, and assign car photo images & pricing."""
    Base.metadata.create_all(bind=engine)

    # Auto-migrate SQLite schema
    with engine.connect() as conn:
        # Check users status
        res_users = conn.execute(text("PRAGMA table_info(users)")).fetchall()
        user_cols = [row[1] for row in res_users]
        if "status" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Approved'"))

        # Check vehicles image_url
        res_veh = conn.execute(text("PRAGMA table_info(vehicles)")).fetchall()
        veh_cols = [row[1] for row in res_veh]
        if "image_url" not in veh_cols:
            conn.execute(text("ALTER TABLE vehicles ADD COLUMN image_url VARCHAR(500)"))

        # Check orders payment_proof
        res_ord = conn.execute(text("PRAGMA table_info(orders)")).fetchall()
        ord_cols = [row[1] for row in res_ord]
        if "payment_proof" not in ord_cols:
            conn.execute(text("ALTER TABLE orders ADD COLUMN payment_proof VARCHAR(500)"))

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

        # Update vehicle prices (> 100,000,000 INR) and image_urls
        vehicles = db.query(Vehicle).all()
        base_prices = [125000000.0, 185000000.0, 240000000.0, 310000000.0, 145000000.0, 220000000.0, 295000000.0]
        for idx, v in enumerate(vehicles):
            if v.price < 100000000.0:
                v.price = base_prices[idx % len(base_prices)] + (random.randint(1, 50) * 1000000.0)
            if not v.image_url:
                v.image_url = SAMPLE_CAR_IMAGES[idx % len(SAMPLE_CAR_IMAGES)]
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
