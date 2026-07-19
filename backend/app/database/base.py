# ==========================================
# SQLAlchemy Base Model
# ==========================================
# All ORM models (like Vehicle, User) will inherit from this Base.
# SQLAlchemy uses Base to keep track of all table definitions.
# When we call Base.metadata.create_all(), it creates all tables.
# ==========================================

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.

    Every model in the app/models/ directory should inherit from this class.

    Example:
        class Vehicle(Base):
            __tablename__ = "vehicles"
            id = Column(Integer, primary_key=True)
    """
    pass
