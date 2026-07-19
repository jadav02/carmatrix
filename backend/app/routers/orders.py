from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.order import OrderCheckoutRequest, OrderResponse
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["Customer Orders & Purchasing"])


@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout(
    checkout_in: OrderCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Process customer checkout and generate order purchase receipt.
    """
    return order_service.checkout_order(db, checkout_in, current_user)


@router.get("/my-orders", response_model=list[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve purchase history for the logged-in customer.
    """
    return order_service.get_customer_orders(db, current_user.id)


@router.get("/all", response_model=list[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Administrator: View all customer purchase orders across dealership.
    """
    return order_service.get_all_orders(db)
