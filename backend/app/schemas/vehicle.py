# ==========================================
# Vehicle Schemas
# ==========================================

from pydantic import BaseModel, Field


class VehicleCreate(BaseModel):
    make: str = Field(..., min_length=1, max_length=100)
    model: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., gt=0)
    quantity: int = Field(default=0, ge=0)
    image_url: str | None = Field(None, max_length=500)


class VehicleUpdate(BaseModel):
    make: str | None = Field(None, min_length=1, max_length=100)
    model: str | None = Field(None, min_length=1, max_length=100)
    category: str | None = Field(None, min_length=1, max_length=50)
    price: float | None = Field(None, gt=0)
    quantity: int | None = Field(None, ge=0)
    image_url: str | None = Field(None, max_length=500)


class VehicleResponse(BaseModel):
    id: int
    make: str
    model: str
    category: str
    price: float
    quantity: int
    image_url: str | None = None

    class Config:
        from_attributes = True


class InventorySummary(BaseModel):
    total_vehicles: int
    total_quantity: int
    total_inventory_value: float
    low_stock_count: int
