# ==========================================
# Vehicle Service
# ==========================================
# Business logic for vehicle CRUD operations and inventory valuation.
# ==========================================

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def _format_vehicle_response(vehicle: Vehicle) -> dict:
    """Helper to convert Vehicle ORM object to response dict with calculated unit profit."""
    p_price = float(vehicle.purchase_price) if vehicle.purchase_price and vehicle.purchase_price > 0 else round(float(vehicle.price) * 0.75, 2)
    s_price = float(vehicle.selling_price) if vehicle.selling_price and vehicle.selling_price > 0 else float(vehicle.price)
    price = s_price
    profit_per_unit = round(s_price - p_price, 2)

    return {
        "id": vehicle.id,
        "make": vehicle.make,
        "model": vehicle.model,
        "category": vehicle.category,
        "purchase_price": p_price,
        "selling_price": s_price,
        "price": price,
        "profit_per_unit": profit_per_unit,
        "quantity": vehicle.quantity,
        "image_url": vehicle.image_url,
    }


def create_vehicle(db: Session, vehicle_in: VehicleCreate) -> dict:
    """
    Create a new vehicle record with purchase price and selling price.
    """
    s_price = float(vehicle_in.selling_price if vehicle_in.selling_price is not None else (vehicle_in.price or 0.0))
    p_price = float(vehicle_in.purchase_price if vehicle_in.purchase_price is not None else round(s_price * 0.75, 2))

    new_vehicle = Vehicle(
        make=vehicle_in.make,
        model=vehicle_in.model,
        category=vehicle_in.category,
        purchase_price=p_price,
        selling_price=s_price,
        price=s_price,
        quantity=vehicle_in.quantity,
        image_url=vehicle_in.image_url,
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return _format_vehicle_response(new_vehicle)


def get_vehicle(db: Session, vehicle_id: int) -> dict:
    """
    Retrieve a single vehicle by ID.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {vehicle_id} not found",
        )

    return _format_vehicle_response(vehicle)


def get_all_vehicles(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    in_stock_only: bool = False,
) -> list[dict]:
    """
    Retrieve vehicles with optional search, category, price, and stock filtering.
    """
    query = db.query(Vehicle)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Vehicle.make.ilike(search_pattern)) | (Vehicle.model.ilike(search_pattern))
        )

    if category and category.lower() != 'all':
        query = query.filter(Vehicle.category.ilike(category))

    if min_price is not None:
        query = query.filter(Vehicle.price >= min_price)

    if max_price is not None:
        query = query.filter(Vehicle.price <= max_price)

    if in_stock_only:
        query = query.filter(Vehicle.quantity > 0)

    vehicles = query.all()
    return [_format_vehicle_response(v) for v in vehicles]


def get_inventory_summary(db: Session) -> dict:
    """
    Calculate aggregate inventory valuation metrics:
    - total_vehicles
    - total_quantity
    - total_inventory_value (selling value)
    - total_purchase_cost (cost value)
    - potential_total_profit (inventory profit margin)
    - low_stock_count
    """
    vehicles = db.query(Vehicle).all()

    total_vehicles = len(vehicles)
    total_quantity = sum(v.quantity for v in vehicles)

    total_inventory_value = sum(
        (v.selling_price if v.selling_price > 0 else v.price) * v.quantity
        for v in vehicles
    )
    total_purchase_cost = sum(
        (v.purchase_price if v.purchase_price > 0 else round(v.price * 0.75, 2)) * v.quantity
        for v in vehicles
    )
    potential_total_profit = total_inventory_value - total_purchase_cost
    low_stock_count = sum(1 for v in vehicles if v.quantity <= 3)

    return {
        "total_vehicles": total_vehicles,
        "total_quantity": total_quantity,
        "total_inventory_value": round(total_inventory_value, 2),
        "total_purchase_cost": round(total_purchase_cost, 2),
        "potential_total_profit": round(potential_total_profit, 2),
        "low_stock_count": low_stock_count,
    }


def update_vehicle(db: Session, vehicle_id: int, vehicle_in: VehicleUpdate) -> dict:
    """
    Update an existing vehicle's details including purchase and selling price.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {vehicle_id} not found",
        )

    update_data = vehicle_in.model_dump(exclude_unset=True)

    if "selling_price" in update_data and update_data["selling_price"] is not None:
        vehicle.selling_price = float(update_data["selling_price"])
        vehicle.price = float(update_data["selling_price"])
    elif "price" in update_data and update_data["price"] is not None:
        vehicle.selling_price = float(update_data["price"])
        vehicle.price = float(update_data["price"])

    if "purchase_price" in update_data and update_data["purchase_price"] is not None:
        vehicle.purchase_price = float(update_data["purchase_price"])

    for field in ["make", "model", "category", "quantity", "image_url"]:
        if field in update_data and update_data[field] is not None:
            setattr(vehicle, field, update_data[field])

    db.commit()
    db.refresh(vehicle)

    return _format_vehicle_response(vehicle)


def delete_vehicle(db: Session, vehicle_id: int) -> dict:
    """
    Delete a vehicle from the database.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with id {vehicle_id} not found",
        )

    db.delete(vehicle)
    db.commit()

    return {"message": f"Vehicle with id {vehicle_id} deleted successfully"}
