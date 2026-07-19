# ==========================================
# Order and OrderItem Database Models
# ==========================================

from datetime import datetime, timezone
from sqlalchemy import Float, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Order(Base):
    """
    SQLAlchemy ORM model representing a Customer Purchase Order.
    Includes financial breakdown: total selling amount, total purchase cost, and net profit.
    """
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False)
    shipping_address: Mapped[str] = mapped_column(String(255), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    payment_type: Mapped[str | None] = mapped_column(String(50), default="Token Payment", nullable=True)
    payment_proof: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    total_cost: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    total_profit: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    
    amount_paid: Mapped[float | None] = mapped_column(Float, default=100000.0, nullable=True)
    balance_due: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    
    status: Mapped[str] = mapped_column(String(20), default="Completed", nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """
    SQLAlchemy ORM model representing individual vehicle items in an order.
    Includes unit purchase cost and calculated item profit.
    """
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.id"), nullable=False)
    
    vehicle_make: Mapped[str] = mapped_column(String(100), nullable=False)
    vehicle_model: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    unit_cost: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)
    profit: Mapped[float | None] = mapped_column(Float, default=0.0, nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
