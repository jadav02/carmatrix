# ==========================================
# Vehicle Router with RBAC
# ==========================================

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_inventory_manager
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
    current_user: User = Depends(require_inventory_manager),
):
    """
    Create a new vehicle (Administrator & Inventory Manager only).
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
    Retrieve vehicles (All approved users).
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
    Get inventory statistics summary (All approved users).
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
    """
    return vehicle_service.get_vehicle(db=db, vehicle_id=vehicle_id)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inventory_manager),
):
    """
    Update an existing vehicle (Administrator & Inventory Manager only).
    """
    return vehicle_service.update_vehicle(db=db, vehicle_id=vehicle_id, vehicle_in=vehicle_in)


@router.delete("/{vehicle_id}", status_code=status.HTTP_200_OK)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inventory_manager),
):
    """
    Delete a vehicle by ID (Administrator & Inventory Manager).
    """
    return vehicle_service.delete_vehicle(db=db, vehicle_id=vehicle_id)
