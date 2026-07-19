# ==========================================
# User Database Model
# ==========================================
# Defines the 'users' table structure with RBAC fields:
#   - role: 'admin', 'manager', 'sales'
#   - status: 'Pending', 'Approved', 'Rejected'
# ==========================================

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    """
    SQLAlchemy ORM model representing a User in the system.

    Attributes:
        id: Primary key, unique identifier.
        name: Full name of the user.
        email: Unique, indexed email address used for login.
        hashed_password: Hashed password string.
        role: RBAC role ('admin', 'manager', 'sales').
        status: Approval status ('Pending', 'Approved', 'Rejected').
    """
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), default="sales", server_default="sales", nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default="Pending", server_default="Pending", nullable=False
    )
