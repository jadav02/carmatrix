# ==========================================
# Vehicle Schemas
# ==========================================

from pydantic import BaseModel, Field


class VehicleCreate(BaseModel):
    make: str = Field(..., min_length=1, max_length=100)
    model: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    purchase_price: float | None = Field(None, gt=0)
    selling_price: float | None = Field(None, gt=0)
    price: float | None = Field(None, gt=0)
    quantity: int = Field(default=0, ge=0)
    image_url: str | None = Field(None, max_length=500)


class VehicleUpdate(BaseModel):
    make: str | None = Field(None, min_length=1, max_length=100)
    model: str | None = Field(None, min_length=1, max_length=100)
    category: str | None = Field(None, min_length=1, max_length=50)
    purchase_price: float | None = Field(None, gt=0)
    selling_price: float | None = Field(None, gt=0)
    price: float | None = Field(None, gt=0)
    quantity: int | None = Field(None, ge=0)
    image_url: str | None = Field(None, max_length=500)


class VehicleResponse(BaseModel):
    id: int
    make: str
    model: str
    category: str
    purchase_price: float = 0.0
    selling_price: float = 0.0
    price: float = 0.0
    profit_per_unit: float = 0.0
    quantity: int
    image_url: str | None = None

    class Config:
        from_attributes = True


class InventorySummary(BaseModel):
    total_vehicles: int
    total_quantity: int
    total_inventory_value: float
    total_purchase_cost: float = 0.0
    potential_total_profit: float = 0.0
    low_stock_count: int
