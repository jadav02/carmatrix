# ==========================================
# Pytest Test Fixtures & Test Database Setup
# ==========================================

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.core.security import hash_password
from app.models.user import User
from app.models.vehicle import Vehicle

# Create in-memory SQLite database for isolated test runs
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database schema for each test function."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed default Admin
    admin_user = User(
        name="Admin Test",
        email="admin.test@carmatrix.com",
        hashed_password=hash_password("AdminPass123!"),
        role="admin",
        status="Approved",
    )
    # Seed default Vehicle
    car = Vehicle(
        make="Porsche",
        model="911 GT3",
        category="Coupe",
        price=250000000.0,
        quantity=5,
        image_url="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=80"
    )
    db.add(admin_user)
    db.add(car)
    db.commit()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session):
    """FastAPI TestClient with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
