from app.routers.auth import router as auth_router
from app.routers.vehicle import router as vehicle_router
from app.routers.inventory import router as inventory_router
from app.routers.users import router as users_router
from app.routers.sales import router as sales_router

__all__ = ["auth_router", "vehicle_router", "inventory_router", "users_router", "sales_router"]
