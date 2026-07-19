# ==========================================
# Inventory Service
# ==========================================
# Business logic for inventory operations:
#   - Purchase: Decreases stock level, checks for insufficient stock (prevents negative quantity).
#   - Restock: Increases stock level.
#   - Inventory Status: Retrieves list of vehicles with current stock levels.
# ==========================================

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.inventory import (
    InventoryPurchaseRequest,
    InventoryRestockRequest,
    InventoryOperationResponse,
)


def purchase_vehicle(db: Session, request: InventoryPurchaseRequest) -> dict:
    """
    Process a vehicle purchase transaction (decreases stock).

    Validations:
    - Vehicle must exist in database (404 Not Found if missing).
    - Requested quantity must not exceed available stock (400 Bad Request if insufficient).

    Actions:
    - Decreases vehicle.quantity by request.quantity.
    - Commits transaction to database.

    Returns:
        dict: Transaction response matching InventoryOperationResponse schema.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicle_id).first()

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {request.vehicle_id} not found",
        )

    if vehicle.quantity < request.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Requested: {request.quantity}, Available: {vehicle.quantity}",
        )

    previous_qty = vehicle.quantity
    vehicle.quantity -= request.quantity

    db.commit()
    db.refresh(vehicle)

    return {
        "message": "Purchase successful",
        "vehicle_id": vehicle.id,
        "make": vehicle.make,
        "model": vehicle.model,
        "previous_quantity": previous_qty,
        "new_quantity": vehicle.quantity,
    }


def restock_vehicle(db: Session, request: InventoryRestockRequest) -> dict:
    """
    Process a vehicle restock transaction (increases stock).

    Validations:
    - Vehicle must exist in database (404 Not Found if missing).

    Actions:
    - Increases vehicle.quantity by request.quantity.
    - Commits transaction to database.

    Returns:
        dict: Transaction response matching InventoryOperationResponse schema.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicle_id).first()

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {request.vehicle_id} not found",
        )

    previous_qty = vehicle.quantity
    vehicle.quantity += request.quantity

    db.commit()
    db.refresh(vehicle)

    return {
        "message": "Restock successful",
        "vehicle_id": vehicle.id,
        "make": vehicle.make,
        "model": vehicle.model,
        "previous_quantity": previous_qty,
        "new_quantity": vehicle.quantity,
    }


def get_inventory_status(db: Session) -> list[Vehicle]:
    """
    Retrieve current inventory listing showing stock levels for all vehicles.

    Returns:
        list[Vehicle]: List of all vehicle ORM objects.
    """
    return db.query(Vehicle).all()
