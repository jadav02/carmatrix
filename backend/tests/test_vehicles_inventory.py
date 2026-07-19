# ==========================================
# Vehicle CRUD & Inventory Management Tests
# ==========================================
# Tests admin and manager CRUD operations on vehicles,
# inventory summary statistics, search, and edge cases.

import pytest


def _admin_headers(client):
    """Helper: Login as seeded admin and return auth headers."""
    login = client.post("/api/auth/login", json={
        "email": "admin.test@carmatrix.com",
        "password": "AdminPass123!"
    })
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _customer_headers(client, email="view_cust@example.com"):
    """Helper: Register/login as a customer and return auth headers."""
    client.post("/api/auth/register", json={
        "name": "Viewer", "email": email,
        "password": "Pass123!", "role": "customer"
    })
    token = client.post("/api/auth/login", json={
        "email": email, "password": "Pass123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_all_vehicles(client):
    """Any authenticated user can view the vehicle catalog."""
    headers = _customer_headers(client)
    res = client.get("/api/vehicles/", headers=headers)
    assert res.status_code == 200
    vehicles = res.json()
    assert len(vehicles) >= 1
    assert vehicles[0]["make"] == "Porsche"


def test_create_vehicle_as_admin(client):
    """Administrator can create a new vehicle entry."""
    headers = _admin_headers(client)
    payload = {
        "make": "BMW",
        "model": "M4 Competition",
        "category": "Coupe",
        "price": 180000000.0,
        "quantity": 3
    }
    res = client.post("/api/vehicles/", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["make"] == "BMW"
    assert data["model"] == "M4 Competition"
    assert data["price"] == 180000000.0
    assert data["quantity"] == 3


def test_update_vehicle_as_admin(client):
    """Administrator can update vehicle price and quantity."""
    headers = _admin_headers(client)

    vehicles = client.get("/api/vehicles/", headers=headers).json()
    v_id = vehicles[0]["id"]

    res = client.put(f"/api/vehicles/{v_id}", json={
        "price": 275000000.0,
        "quantity": 8
    }, headers=headers)
    assert res.status_code == 200
    assert res.json()["price"] == 275000000.0
    assert res.json()["quantity"] == 8


def test_delete_vehicle_as_admin(client):
    """Administrator can delete a vehicle from inventory."""
    headers = _admin_headers(client)

    # Create a vehicle to delete
    create_res = client.post("/api/vehicles/", json={
        "make": "DeleteMe", "model": "Test", "category": "Sedan",
        "price": 100000000.0, "quantity": 1
    }, headers=headers)
    v_id = create_res.json()["id"]

    del_res = client.delete(f"/api/vehicles/{v_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify the vehicle is gone
    get_res = client.get(f"/api/vehicles/{v_id}", headers=headers)
    assert get_res.status_code == 404


def test_get_inventory_summary(client):
    """Any authenticated user can fetch aggregate inventory summary stats."""
    headers = _customer_headers(client, email="summary_cust@example.com")
    res = client.get("/api/vehicles/summary", headers=headers)
    assert res.status_code == 200
    summary = res.json()
    assert "total_vehicles" in summary
    assert "total_quantity" in summary
    assert "total_inventory_value" in summary
    assert "low_stock_count" in summary
    assert summary["total_vehicles"] >= 1


def test_vehicle_search_by_name(client):
    """Vehicle search filters by make or model name."""
    headers = _admin_headers(client)
    res = client.get("/api/vehicles/?search=Porsche", headers=headers)
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    assert all("Porsche" in v["make"] for v in results)


def test_vehicle_filter_by_category(client):
    """Vehicle filtering by category returns only matching vehicles."""
    headers = _admin_headers(client)
    # Seeded vehicle is a Coupe
    res = client.get("/api/vehicles/?category=Coupe", headers=headers)
    assert res.status_code == 200
    results = res.json()
    for v in results:
        assert v["category"].lower() == "coupe"


def test_vehicle_filter_by_price_range(client):
    """Vehicle filtering by min/max price works correctly."""
    headers = _admin_headers(client)
    res = client.get("/api/vehicles/?min_price=200000000&max_price=300000000", headers=headers)
    assert res.status_code == 200
    results = res.json()
    for v in results:
        assert 200000000 <= v["price"] <= 300000000


def test_vehicle_not_found_404(client):
    """Requesting a non-existent vehicle ID returns 404."""
    headers = _admin_headers(client)
    res = client.get("/api/vehicles/99999", headers=headers)
    assert res.status_code == 404


def test_get_single_vehicle_by_id(client):
    """Retrieve a single vehicle by its ID."""
    headers = _admin_headers(client)
    vehicles = client.get("/api/vehicles/", headers=headers).json()
    v_id = vehicles[0]["id"]

    res = client.get(f"/api/vehicles/{v_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["id"] == v_id
    assert res.json()["make"] == "Porsche"
