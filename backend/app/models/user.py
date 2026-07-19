# ==========================================
# User Database Model
# ==========================================
# This model defines the structure of the 'users' table in the database.
# It inherits from our base metadata class so SQLAlchemy can track it.
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
        hashed_password: Hashed password string (never store plain text!).
        role: Access control role (e.g., 'user', 'admin'). Defaults to 'user'.
    """
    __tablename__ = "users"

    # id is auto-incrementing by default for integer primary keys
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # name is required
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # email must be unique and indexed for fast lookups during login
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    
    # hashed_password stores bcrypt hashes
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # role defaults to 'user'
    role: Mapped[str] = mapped_column(
        String(50), default="user", server_default="user", nullable=False
    )
