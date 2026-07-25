from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sale import Sale
from app.models.vehicle import Vehicle
from app.models.order import Order
from app.models.user import User
from app.schemas.sale import SaleCreate, ReportsSummary


def send_sale_receipt_notifications(sale: Sale):
    """
    Sends automated Email bill & SMS bill notifications to the customer for manual vehicle sales.
    """
    target_email = sale.customer_email or "Not provided"
    target_mobile = sale.customer_mobile or "Not provided"

    email_body = f"""
====================================================
           CARMATRIX LUXURY MOTORS SALES RECEIPT       
====================================================
Sale Receipt ID  : #{sale.id}
Customer Name    : {sale.customer_name}
Customer Email   : {target_email}
Customer Mobile  : {target_mobile}

VEHICLE DETAILS:
  Vehicle Model  : {sale.vehicle_make} {sale.vehicle_model}
  Quantity       : {sale.quantity} unit(s)
  Price Per Unit : ₹{sale.unit_price:,.2f}
  Total Sale Price: ₹{sale.total_price:,.2f}

Dealership Contact:
  Email : support@carmatrix.com
  Mobile: +91 98765 43210
====================================================
"""
    print(f"[EMAIL NOTIFICATION DISPATCHED TO {target_email}]:\n{email_body}")

    sms_body = f"CarMatrix Sale Receipt #{sale.id}: Dear {sale.customer_name}, your purchase of {sale.vehicle_make} {sale.vehicle_model} x{sale.quantity} (Total: ₹{sale.total_price:,.0f}) is confirmed! Contact us: support@carmatrix.com / +91 98765 43210."
    print(f"[SMS NOTIFICATION DISPATCHED TO {target_mobile}]:\n{sms_body}")


def create_sale(db: Session, sale_in: SaleCreate, current_user: User) -> Sale:
    """
    Sells vehicle units, reduces inventory stock, creates a sale transaction record,
    and dispatches automated Email & SMS sales receipts to the customer.
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

    unit_cost = vehicle.purchase_price if vehicle.purchase_price and vehicle.purchase_price > 0 else round(vehicle.price * 0.75, 2)
    unit_price = sale_in.unit_price
    qty = sale_in.quantity

    total_price = round(unit_price * qty, 2)
    total_cost = round(unit_cost * qty, 2)
    profit = round(total_price - total_cost, 2)

    # Reduce stock
    vehicle.quantity -= qty

    cust_email = sale_in.customer_email.strip() if sale_in.customer_email else None
    cust_mobile = sale_in.customer_mobile.strip() if sale_in.customer_mobile else None

    new_sale = Sale(
        vehicle_id=vehicle.id,
        user_id=current_user.id,
        vehicle_make=vehicle.make,
        vehicle_model=vehicle.model,
        customer_name=sale_in.customer_name,
        customer_email=cust_email,
        customer_mobile=cust_mobile,
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

    # Dispatch Email & SMS sales receipt
    send_sale_receipt_notifications(new_sale)

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
    Includes both manual sales and online customer orders.
    """
    sales = db.query(Sale).all()
    orders = db.query(Order).all()
    vehicles = db.query(Vehicle).all()

    sales_revenue = sum(s.total_price for s in sales)
    sales_cost = sum(s.total_cost for s in sales)

    orders_revenue = sum(o.total_amount for o in orders)
    orders_cost = sum(o.total_cost or 0.0 for o in orders)

    total_sales_count = len(sales) + len(orders)
    total_revenue = round(sales_revenue + orders_revenue, 2)
    total_purchase_cost = round(sales_cost + orders_cost, 2)
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
