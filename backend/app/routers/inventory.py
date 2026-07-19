# ==========================================
# Inventory Router with RBAC
# ==========================================

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_user, require_inventory_manager
from app.models.user import User
from app.schemas.inventory import (
    InventoryPurchaseRequest,
    InventoryRestockRequest,
    InventoryOperationResponse,
)
from app.schemas.vehicle import VehicleResponse
from app.services import inventory_service

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.post(
    "/purchase",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_200_OK,
)
def purchase_stock(
    request: InventoryPurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inventory_manager),
):
    """
    Purchase vehicle stock (decreases quantity). (Administrator & Inventory Manager only).
    """
    return inventory_service.purchase_vehicle(db=db, request=request)


@router.post(
    "/restock",
    response_model=InventoryOperationResponse,
    status_code=status.HTTP_200_OK,
)
def restock_stock(
    request: InventoryRestockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inventory_manager),
):
    """
    Restock vehicle inventory (increases quantity). (Administrator & Inventory Manager only).
    """
    return inventory_service.restock_vehicle(db=db, request=request)


@router.get(
    "",
    response_model=list[VehicleResponse],
    status_code=status.HTTP_200_OK,
)
def get_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current inventory listing showing all vehicles and stock levels.
    """
    return inventory_service.get_inventory_status(db=db)
