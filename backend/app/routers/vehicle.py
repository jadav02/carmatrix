# ==========================================
# Vehicle Router
# ==========================================
# CRUD endpoints for managing vehicles.
# All endpoints require authentication.
# ==========================================

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse, InventorySummary
from app.services import vehicle_service

router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"],
)


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new vehicle.

    Requires authentication.
    """
    return vehicle_service.create_vehicle(db=db, vehicle_in=vehicle_in)


@router.get("/", response_model=list[VehicleResponse])
def get_all_vehicles(
    search: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    in_stock_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve all vehicles with optional search, category, price, and stock filters.

    Requires authentication.
    """
    return vehicle_service.get_all_vehicles(
        db=db,
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
        in_stock_only=in_stock_only,
    )


@router.get("/summary", response_model=InventorySummary)
def get_inventory_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get high-level inventory statistics and metrics.

    Requires authentication.
    """
    return vehicle_service.get_inventory_summary(db=db)


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve a single vehicle by ID.

    Requires authentication.
    """
    return vehicle_service.get_vehicle(db=db, vehicle_id=vehicle_id)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing vehicle (partial update).

    Only provided fields are updated. Requires authentication.
    """
    return vehicle_service.update_vehicle(db=db, vehicle_id=vehicle_id, vehicle_in=vehicle_in)


@router.delete("/{vehicle_id}", status_code=status.HTTP_200_OK)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a vehicle by ID.

    Requires authentication.
    """
    return vehicle_service.delete_vehicle(db=db, vehicle_id=vehicle_id)
