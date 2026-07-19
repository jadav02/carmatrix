from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class SaleCreate(BaseModel):
    """
    Schema for recording a new vehicle sale.
    """
    vehicle_id: int = Field(..., gt=0, description="ID of the vehicle being sold")
    customer_name: str = Field(..., min_length=1, max_length=150, description="Customer name")
    quantity: int = Field(..., gt=0, description="Number of units sold")
    unit_price: float = Field(..., gt=0, description="Sale price per unit")

class SaleResponse(BaseModel):
    """
    Schema for returning sale details.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    user_id: int
    vehicle_make: str
    vehicle_model: str
    customer_name: str
    quantity: int
    unit_price: float
    unit_cost: float
    total_price: float
    total_cost: float
    profit: float
    created_at: datetime

class ReportsSummary(BaseModel):
    """
    Schema for high-level financial reports dashboard.
    """
    total_sales: int = Field(..., description="Total number of sales transactions")
    total_purchase_cost: float = Field(..., description="Total cost of inventory sold")
    total_revenue: float = Field(..., description="Total revenue generated from sales")
    total_profit: float = Field(..., description="Total profit (Revenue - Cost)")
    available_stock: int = Field(..., description="Total available vehicle units in stock")
    low_stock_vehicles: int = Field(..., description="Number of low stock vehicles")
    recent_sales: list[SaleResponse] = Field(default=[], description="List of recent sales")
