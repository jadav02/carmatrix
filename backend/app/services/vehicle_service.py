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


def get_all_vehicles(db: Session) -> list[Vehicle]:
    """
    Retrieve all vehicles from the database.

    Args:
        db: Database session.

    Returns:
        list[Vehicle]: List of all vehicle ORM objects.
    """
    return db.query(Vehicle).all()


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
