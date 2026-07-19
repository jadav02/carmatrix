# ==========================================
# Inventory Schemas
# ==========================================
# Schemas for inventory operations:
#   - InventoryPurchaseRequest: Input data to purchase/decrease stock.
#   - InventoryRestockRequest: Input data to restock/increase stock.
#   - InventoryOperationResponse: Output payload following a stock transaction.
# ==========================================

from pydantic import BaseModel, Field


class InventoryPurchaseRequest(BaseModel):
    """
    Schema for purchasing/selling a vehicle (decreases stock).
    """
    vehicle_id: int = Field(..., gt=0, description="ID of the vehicle being purchased")
    quantity: int = Field(..., gt=0, description="Number of units to purchase (must be > 0)")


class InventoryRestockRequest(BaseModel):
    """
    Schema for restocking a vehicle (increases stock).
    """
    vehicle_id: int = Field(..., gt=0, description="ID of the vehicle to restock")
    quantity: int = Field(..., gt=0, description="Number of units to add to stock (must be > 0)")


class InventoryOperationResponse(BaseModel):
    """
    Schema for transaction confirmation output.
    """
    message: str = Field(..., description="Transaction status message")
    vehicle_id: int = Field(..., description="ID of the vehicle")
    make: str = Field(..., description="Vehicle make")
    model: str = Field(..., description="Vehicle model")
    previous_quantity: int = Field(..., description="Stock quantity before transaction")
    new_quantity: int = Field(..., description="Stock quantity after transaction")
