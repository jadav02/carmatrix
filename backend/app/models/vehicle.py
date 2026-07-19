# ==========================================
# Vehicle Database Model
# ==========================================
# This model defines the structure of the 'vehicles' table in the database.
# It stores car inventory data: make, model, category, price, and quantity.
# ==========================================

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Vehicle(Base):
    """
    SQLAlchemy ORM model representing a Vehicle in the inventory.

    Attributes:
        id: Primary key, unique identifier.
        make: Manufacturer name (e.g., Toyota, Honda).
        model: Model name (e.g., Camry, Civic).
        category: Vehicle category (e.g., Sedan, SUV, Truck).
        price: Price of the vehicle.
        quantity: Number of units in stock.
    """
    __tablename__ = "vehicles"

    # Auto-incrementing primary key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Manufacturer name
    make: Mapped[str] = mapped_column(String(100), nullable=False)

    # Model name
    model: Mapped[str] = mapped_column(String(100), nullable=False)

    # Vehicle category (Sedan, SUV, Truck, etc.)
    category: Mapped[str] = mapped_column(String(50), nullable=False)

    # Price of the vehicle
    price: Mapped[float] = mapped_column(Float, nullable=False)

    # Number of units in stock
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
