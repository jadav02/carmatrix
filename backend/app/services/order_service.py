from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.order import OrderCheckoutRequest


def checkout_order(db: Session, checkout_in: OrderCheckoutRequest, current_user: User) -> Order:
    """
    Processes customer checkout: validates vehicle stock, reduces inventory,
    calculates totals, saves payment proof, and records the purchase transaction.
    """
    total_amount = 0.0
    order_items_to_create = []

    for item in checkout_in.items:
        vehicle = db.query(Vehicle).filter(Vehicle.id == item.vehicle_id).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle #{item.vehicle_id} not found"
            )

        if vehicle.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {vehicle.make} {vehicle.model}. Available: {vehicle.quantity} units."
            )

        # Reduce stock
        vehicle.quantity -= item.quantity

        unit_price = float(vehicle.price)
        subtotal = round(unit_price * item.quantity, 2)
        total_amount += subtotal

        order_items_to_create.append({
            "vehicle_id": vehicle.id,
            "vehicle_make": vehicle.make,
            "vehicle_model": vehicle.model,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
        })

    new_order = Order(
        user_id=current_user.id,
        customer_name=current_user.name,
        customer_email=current_user.email,
        shipping_address=checkout_in.shipping_address,
        payment_method=checkout_in.payment_method,
        payment_proof=checkout_in.payment_proof,
        total_amount=round(total_amount, 2),
        status="Completed",
    )

    db.add(new_order)
    db.flush()

    for item_data in order_items_to_create:
        item_obj = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(item_obj)

    db.commit()
    db.refresh(new_order)
    return new_order


def get_customer_orders(db: Session, user_id: int) -> list[Order]:
    """
    Retrieves purchase history for a specific customer.
    """
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()


def get_all_orders(db: Session) -> list[Order]:
    """
    Retrieves all customer purchase orders for management.
    """
    return db.query(Order).order_by(Order.created_at.desc()).all()
