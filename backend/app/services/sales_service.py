from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sale import Sale
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.sale import SaleCreate, ReportsSummary


def create_sale(db: Session, sale_in: SaleCreate, current_user: User) -> Sale:
    """
    Sells vehicle units, reduces inventory stock, and creates a sale transaction record.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == sale_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )

    if vehicle.quantity < sale_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Only {vehicle.quantity} unit(s) available."
        )

    unit_cost = float(vehicle.price * 0.75)  # 75% of list price as purchase cost base or list price
    unit_price = float(sale_in.unit_price)
    qty = sale_in.quantity

    total_price = round(unit_price * qty, 2)
    total_cost = round(unit_cost * qty, 2)
    profit = round(total_price - total_cost, 2)

    # Reduce stock
    vehicle.quantity -= qty

    new_sale = Sale(
        vehicle_id=vehicle.id,
        user_id=current_user.id,
        vehicle_make=vehicle.make,
        vehicle_model=vehicle.model,
        customer_name=sale_in.customer_name,
        quantity=qty,
        unit_price=unit_price,
        unit_cost=unit_cost,
        total_price=total_price,
        total_cost=total_cost,
        profit=profit,
    )

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale


def get_sales_history(db: Session, user_id: int = None) -> list[Sale]:
    """
    Retrieves sales history. Filtered by user_id if provided (for Sales Representatives).
    """
    query = db.query(Sale)
    if user_id:
        query = query.filter(Sale.user_id == user_id)
    return query.order_by(Sale.created_at.desc()).all()


def get_reports_summary(db: Session) -> dict:
    """
    Aggregates financial and stock metrics for Administrator Reports Dashboard.
    """
    sales = db.query(Sale).all()
    vehicles = db.query(Vehicle).all()

    total_sales_count = len(sales)
    total_revenue = round(sum(s.total_price for s in sales), 2)
    total_purchase_cost = round(sum(s.total_cost for s in sales), 2)
    total_profit = round(total_revenue - total_purchase_cost, 2)

    available_stock = sum(v.quantity for v in vehicles)
    low_stock_vehicles = sum(1 for v in vehicles if v.quantity <= 3)

    recent_sales = db.query(Sale).order_by(Sale.created_at.desc()).limit(5).all()

    return {
        "total_sales": total_sales_count,
        "total_purchase_cost": total_purchase_cost,
        "total_revenue": total_revenue,
        "total_profit": total_profit,
        "available_stock": available_stock,
        "low_stock_vehicles": low_stock_vehicles,
        "recent_sales": recent_sales,
    }
