# ==========================================
# CarMatrix API — Main Entry Point
# ==========================================
# This is the main file that creates and configures the FastAPI app.
# It sets up:
#   1. The FastAPI application instance with Swagger metadata.
#   2. CORS middleware (allows frontend to call the API).
#   3. Database table creation on startup.
#   4. Health check endpoints.
#
# Run the server with:
#   uvicorn app.main:app --reload
# ==========================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth_router, vehicle_router, inventory_router


# ==========================================
# 1. Create the FastAPI Application
# ==========================================
# title, description, version: Shown on the Swagger docs page.
# docs_url: Path for Swagger UI (default is /docs).
# redoc_url: Path for ReDoc UI (default is /redoc).
# ==========================================
app = FastAPI(
    title=settings.APP_NAME,
    description="CarMatrix REST API for managing dealership vehicle inventory, "
                "stock purchases, restocking, and JWT authentication.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ==========================================
# 2. Configure CORS Middleware
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 3. Create Database Tables on Startup
# ==========================================
@app.on_event("startup")
def on_startup():
    """Create all database tables when the application starts."""
    Base.metadata.create_all(bind=engine)


# ==========================================
# 4. Health Check Endpoints
# ==========================================

@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Returns the project name and server status.",
)
def root():
    """
    Root endpoint — confirms the server is running.

    Returns:
        dict: Project name and running status.
    """
    return {
        "status": "running",
        "project": settings.APP_NAME,
    }


@app.get(
    f"{settings.API_PREFIX}/health",
    tags=["Health"],
    summary="Health check",
    description="Returns the health status of the API.",
)
def health_check():
    """
    Health check endpoint — used by monitoring tools.

    Returns:
        dict: Health status of the API.
    """
    return {
        "status": "healthy",
    }


# ==========================================
# 5. Include API Routers
# ==========================================
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(vehicle_router, prefix=settings.API_PREFIX)
app.include_router(inventory_router, prefix=settings.API_PREFIX)
