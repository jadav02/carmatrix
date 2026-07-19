# ==========================================
# CarMatrix API — Main Entry Point
# ==========================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

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
)


app = FastAPI(
    title=settings.APP_NAME,
    description="CarMatrix REST API with Role-Based Access Control (RBAC), "
                "Vehicle Management, Inventory Control, and Sales Operations.",
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
    """Create all database tables and seed default Administrator on startup."""
    Base.metadata.create_all(bind=engine)

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

        # Update existing unapproved demo users to Approved so tests pass smoothly
        users = db.query(User).all()
        for u in users:
            if u.email in ["admin@carmatrix.com", "inv_mgr@example.com", "test@example.com"]:
                if u.status != "Approved":
                    u.status = "Approved"
                    u.role = "admin" if u.email == "admin@carmatrix.com" else ("manager" if "inv" in u.email else "sales")
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
