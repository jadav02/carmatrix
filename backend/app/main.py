# ==========================================
# Car Dealership Inventory System — Entry Point
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


# ==========================================
# 1. Create the FastAPI Application
# ==========================================
# title, description, version: Shown on the Swagger docs page.
# docs_url: Path for Swagger UI (default is /docs).
# redoc_url: Path for ReDoc UI (default is /redoc).
# ==========================================
app = FastAPI(
    title=settings.APP_NAME,
    description="A REST API for managing car dealership inventory. "
                "Supports vehicle CRUD operations, inventory management, "
                "and JWT-based authentication.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ==========================================
# 2. Configure CORS Middleware
# ==========================================
# CORS (Cross-Origin Resource Sharing) controls which websites
# can call our API. Without this, a React frontend running on
# localhost:5173 would be BLOCKED from calling our API on
# localhost:8000.
#
# allow_origins: List of allowed frontend URLs.
#   - ["*"] means allow ALL origins (fine for development).
#   - In production, replace with your actual frontend URL.
# allow_credentials: Allow cookies/auth headers.
# allow_methods: Which HTTP methods are allowed.
# allow_headers: Which HTTP headers are allowed.
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 3. Create Database Tables on Startup
# ==========================================
# This event runs once when the server starts.
# Base.metadata.create_all() looks at all models that inherit
# from Base and creates their tables if they don't exist yet.
# ==========================================
@app.on_event("startup")
def on_startup():
    """Create all database tables when the application starts."""
    Base.metadata.create_all(bind=engine)


# ==========================================
# 4. Health Check Endpoints
# ==========================================
# These endpoints let you quickly verify the server is running.
# They are also used by deployment tools, load balancers, and
# monitoring systems to check if the app is alive.
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
