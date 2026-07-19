from datetime import datetime
from pydantic import BaseModel, Field

class OrderItemCreate(BaseModel):
    vehicle_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)

class OrderCheckoutRequest(BaseModel):
    shipping_address: str = Field(..., min_length=5, max_length=255)
    payment_method: str = Field(..., min_length=2, max_length=50)
    payment_type: str | None = Field("Token Payment", max_length=50)
    payment_proof: str | None = Field(None, max_length=500)
    items: list[OrderItemCreate] = Field(..., min_items=1)

class OrderItemResponse(BaseModel):
    id: int
    vehicle_id: int
    vehicle_make: str
    vehicle_model: str
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    customer_name: str
    customer_email: str
    shipping_address: str
    payment_method: str
    payment_type: str | None = "Token Payment"
    payment_proof: str | None = None
    total_amount: float
    amount_paid: float | None = 100000.0
    balance_due: float | None = 0.0
    status: str
    created_at: datetime
    items: list[OrderItemResponse] = []

    class Config:
        from_attributes = True
