# ==========================================
# Vehicle Schemas
# ==========================================
# Pydantic schemas for vehicle data validation.
#   - VehicleCreate: Input schema for creating a vehicle.
#   - VehicleUpdate: Input schema for updating a vehicle (all fields optional).
#   - VehicleResponse: Output schema returned to the client.
# ==========================================

from pydantic import BaseModel, Field


class VehicleCreate(BaseModel):
    """
    Schema for creating a new vehicle.
    """
    make: str = Field(..., min_length=1, max_length=100, description="Manufacturer name (e.g., Toyota)")
    model: str = Field(..., min_length=1, max_length=100, description="Model name (e.g., Camry)")
    category: str = Field(..., min_length=1, max_length=50, description="Vehicle category (e.g., Sedan, SUV)")
    price: float = Field(..., gt=0, description="Price of the vehicle (must be positive)")
    quantity: int = Field(default=0, ge=0, description="Number of units in stock")


class VehicleUpdate(BaseModel):
    """
    Schema for updating an existing vehicle.
    All fields are optional — only provided fields are updated.
    """
    make: str | None = Field(None, min_length=1, max_length=100, description="Manufacturer name")
    model: str | None = Field(None, min_length=1, max_length=100, description="Model name")
    category: str | None = Field(None, min_length=1, max_length=50, description="Vehicle category")
    price: float | None = Field(None, gt=0, description="Price of the vehicle")
    quantity: int | None = Field(None, ge=0, description="Number of units in stock")


class VehicleResponse(BaseModel):
    """
    Schema for returning vehicle data to the client.
    """
    id: int
    make: str
    model: str
    category: str
    price: float
    quantity: int

    class Config:
        from_attributes = True


class InventorySummary(BaseModel):
    """
    Schema for inventory statistics summary.
    """
    total_vehicles: int = Field(..., description="Number of distinct vehicle models in inventory")
    total_quantity: int = Field(..., description="Total quantity of all vehicles across inventory")
    total_inventory_value: float = Field(..., description="Total financial value of current inventory")
    low_stock_count: int = Field(..., description="Number of vehicles with stock level <= 3")

