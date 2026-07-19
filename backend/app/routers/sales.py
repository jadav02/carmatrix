from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_sales_rep
from app.schemas.sale import SaleCreate, SaleResponse, ReportsSummary
from app.services import sales_service

router = APIRouter(prefix="/sales", tags=["Sales Management"])


@router.post("/", response_model=SaleResponse)
def sell_vehicle(
    sale_in: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_sales_rep),
):
    """
    Sales Representative / Administrator: Sell vehicle and decrease stock.
    """
    return sales_service.create_sale(db, sale_in, current_user)


@router.get("/", response_model=list[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get Sales History. Administrator gets all sales; Sales Representative gets their customer sales.
    """
    if current_user.role == "sales":
        return sales_service.get_sales_history(db, user_id=current_user.id)
    return sales_service.get_sales_history(db)


@router.get("/reports", response_model=ReportsSummary)
def get_reports(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Administrator Only: View financial reports (Total Sales, Revenue, Cost, Profit, Low Stock, Recent Sales).
    """
    return sales_service.get_reports_summary(db)
