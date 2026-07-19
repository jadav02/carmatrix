# ==========================================
# Vehicle Service
# ==========================================
# Business logic for vehicle CRUD operations.
# Each function receives a database session and
# the relevant schema/ID, performs the operation,
# and returns the result or raises an HTTPException.
# ==========================================

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def create_vehicle(db: Session, vehicle_in: VehicleCreate) -> Vehicle:
    """
    Create a new vehicle in the database.

    Args:
        db: Database session.
        vehicle_in: Validated vehicle input data.

    Returns:
        Vehicle: The newly created vehicle ORM object.
    """
    new_vehicle = Vehicle(
        make=vehicle_in.make,
        model=vehicle_in.model,
        category=vehicle_in.category,
        price=vehicle_in.price,
        quantity=vehicle_in.quantity,
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle


def get_vehicle(db: Session, vehicle_id: int) -> Vehicle:
    """
    Retrieve a single vehicle by its ID.

    Args:
        db: Database session.
        vehicle_id: The ID of the vehicle to retrieve.

    Returns:
        Vehicle: The found vehicle ORM object.

    Raises:
        HTTPException 404: If no vehicle exists with the given ID.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {vehicle_id} not found",
        )

    return vehicle


def get_all_vehicles(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    in_stock_only: bool = False,
) -> list[Vehicle]:
    """
    Retrieve vehicles with optional search, category, price, and stock filtering.

    Args:
        db: Database session.
        search: Partial match string for make or model.
        category: Filter by exact vehicle category.
        min_price: Minimum price filter.
        max_price: Maximum price filter.
        in_stock_only: Filter for vehicles with quantity > 0.

    Returns:
        list[Vehicle]: Filtered list of vehicle ORM objects.
    """
    query = db.query(Vehicle)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Vehicle.make.ilike(search_pattern)) | (Vehicle.model.ilike(search_pattern))
        )

    if category:
        query = query.filter(Vehicle.category.ilike(category))

    if min_price is not None:
        query = query.filter(Vehicle.price >= min_price)

    if max_price is not None:
        query = query.filter(Vehicle.price <= max_price)

    if in_stock_only:
        query = query.filter(Vehicle.quantity > 0)

    return query.all()


def get_inventory_summary(db: Session) -> dict:
    """
    Calculate and return aggregate inventory metrics.

    Metrics include:
    - total_vehicles: total number of distinct vehicle records
    - total_quantity: total units in stock across all vehicles
    - total_inventory_value: total financial valuation (sum of price * quantity)
    - low_stock_count: number of vehicle items with quantity <= 3

    Returns:
        dict: Summary statistics dictionary matching InventorySummary schema.
    """
    vehicles = db.query(Vehicle).all()

    total_vehicles = len(vehicles)
    total_quantity = sum(v.quantity for v in vehicles)
    total_inventory_value = sum(v.price * v.quantity for v in vehicles)
    low_stock_count = sum(1 for v in vehicles if v.quantity <= 3)

    return {
        "total_vehicles": total_vehicles,
        "total_quantity": total_quantity,
        "total_inventory_value": round(total_inventory_value, 2),
        "low_stock_count": low_stock_count,
    }


def update_vehicle(db: Session, vehicle_id: int, vehicle_in: VehicleUpdate) -> Vehicle:
    """
    Update an existing vehicle with partial data.

    Only fields that are explicitly provided (not None) are updated.

    Args:
        db: Database session.
        vehicle_id: The ID of the vehicle to update.
        vehicle_in: Validated partial update data.

    Returns:
        Vehicle: The updated vehicle ORM object.

    Raises:
        HTTPException 404: If no vehicle exists with the given ID.
    """
    vehicle = get_vehicle(db, vehicle_id)

    # Only update fields that were explicitly provided
    update_data = vehicle_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)

    return vehicle


def delete_vehicle(db: Session, vehicle_id: int) -> dict:
    """
    Delete a vehicle from the database.

    Args:
        db: Database session.
        vehicle_id: The ID of the vehicle to delete.

    Returns:
        dict: Confirmation message.

    Raises:
        HTTPException 404: If no vehicle exists with the given ID.
    """
    vehicle = get_vehicle(db, vehicle_id)

    db.delete(vehicle)
    db.commit()

    return {"message": f"Vehicle with id {vehicle_id} deleted successfully"}
