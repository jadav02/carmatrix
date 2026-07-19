# ==========================================
# RBAC (Role-Based Access Control) Tests
# ==========================================
# Verifies that admin, manager, and customer roles
# are correctly enforced across all protected endpoints.
# Role matrix:
#   admin → full access
#   manager (require_inventory_manager) → vehicle CRUD
#   customer → view vehicles, checkout, own orders only
#   unauthenticated → denied

import pytest


def _register_and_login(client, role, email, password="Pass123!"):
    """Register and login user with the given role, return headers."""
    client.post("/api/auth/register", json={
        "name": f"Test {role.title()}", "email": email,
        "password": password, "role": role
    })
    token = client.post("/api/auth/login", json={
        "email": email, "password": password
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _admin_headers(client):
    token = client.post("/api/auth/login", json={
        "email": "admin.test@carmatrix.com",
        "password": "AdminPass123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---- Customer Role Restrictions ----

def test_customer_cannot_create_vehicle(client):
    """Customer must not be able to create vehicles (require_inventory_manager)."""
    headers = _register_and_login(client, "customer", "cust_rbac@example.com")
    res = client.post("/api/vehicles/", json={
        "make": "Hack", "model": "Attempt", "category": "Sedan",
        "price": 100000000.0, "quantity": 1
    }, headers=headers)
    assert res.status_code == 403


def test_customer_cannot_update_vehicle(client):
    """Customer must not be able to update vehicles."""
    headers = _register_and_login(client, "customer", "cust_upd@example.com")
    res = client.put("/api/vehicles/1", json={
        "price": 999.0
    }, headers=headers)
    assert res.status_code == 403


def test_customer_cannot_delete_vehicle(client):
    """Customer must not be able to delete vehicles (require_admin)."""
    headers = _register_and_login(client, "customer", "cust_del@example.com")
    res = client.delete("/api/vehicles/1", headers=headers)
    assert res.status_code == 403


def test_customer_cannot_manage_users(client):
    """Customer must not access the user management endpoint."""
    headers = _register_and_login(client, "customer", "cust_users@example.com")
    res = client.get("/api/users/", headers=headers)
    assert res.status_code == 403


def test_customer_can_view_vehicles(client):
    """Customer can view the vehicle catalog."""
    headers = _register_and_login(client, "customer", "cust_view@example.com")
    res = client.get("/api/vehicles/", headers=headers)
    assert res.status_code == 200


def test_customer_can_checkout(client):
    """Customer can place orders through checkout."""
    headers = _register_and_login(client, "customer", "cust_checkout@example.com")
    vehicles = client.get("/api/vehicles/", headers=headers).json()
    if vehicles:
        res = client.post("/api/orders/checkout", json={
            "shipping_address": "RBAC Test Address",
            "payment_method": "UPI Payment",
            "payment_type": "Token Payment",
            "payment_proof": "proof_url",
            "items": [{"vehicle_id": vehicles[0]["id"], "quantity": 1}]
        }, headers=headers)
        assert res.status_code == 201


def test_customer_cannot_view_all_orders(client):
    """Customer must not access admin-only /orders/all endpoint."""
    headers = _register_and_login(client, "customer", "cust_all_orders@example.com")
    res = client.get("/api/orders/all", headers=headers)
    assert res.status_code == 403


# ---- Manager Role Restrictions ----

def test_manager_cannot_manage_users(client):
    """Manager must not access user management."""
    admin_h = _admin_headers(client)

    # Register manager
    client.post("/api/auth/register", json={
        "name": "Manager RBAC", "email": "mgr_rbac@example.com",
        "password": "Pass123!", "role": "manager"
    })

    # Admin approves the manager
    users = client.get("/api/users/", headers=admin_h).json()
    mgr_user = next((u for u in users if u["email"] == "mgr_rbac@example.com"), None)
    if mgr_user:
        client.put(f"/api/users/{mgr_user['id']}/status",
                    json={"status": "Approved"}, headers=admin_h)

    mgr_token = client.post("/api/auth/login", json={
        "email": "mgr_rbac@example.com", "password": "Pass123!"
    }).json()["access_token"]
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    res = client.get("/api/users/", headers=mgr_headers)
    assert res.status_code == 403


def test_manager_can_create_vehicle(client):
    """Approved manager can create vehicles (require_inventory_manager allows admin + manager)."""
    admin_h = _admin_headers(client)

    # Register and approve manager
    client.post("/api/auth/register", json={
        "name": "Mgr Create", "email": "mgr_create@example.com",
        "password": "Pass123!", "role": "manager"
    })
    users = client.get("/api/users/", headers=admin_h).json()
    mgr = next((u for u in users if u["email"] == "mgr_create@example.com"), None)
    if mgr:
        client.put(f"/api/users/{mgr['id']}/status",
                    json={"status": "Approved"}, headers=admin_h)

    mgr_token = client.post("/api/auth/login", json={
        "email": "mgr_create@example.com", "password": "Pass123!"
    }).json()["access_token"]
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    res = client.post("/api/vehicles/", json={
        "make": "Mgr", "model": "Vehicle", "category": "Sedan",
        "price": 150000000.0, "quantity": 2
    }, headers=mgr_headers)
    assert res.status_code == 201


def test_manager_cannot_delete_vehicle(client):
    """Manager cannot delete vehicles (require_admin only)."""
    admin_h = _admin_headers(client)

    client.post("/api/auth/register", json={
        "name": "Mgr Delete", "email": "mgr_del@example.com",
        "password": "Pass123!", "role": "manager"
    })
    users = client.get("/api/users/", headers=admin_h).json()
    mgr = next((u for u in users if u["email"] == "mgr_del@example.com"), None)
    if mgr:
        client.put(f"/api/users/{mgr['id']}/status",
                    json={"status": "Approved"}, headers=admin_h)

    mgr_token = client.post("/api/auth/login", json={
        "email": "mgr_del@example.com", "password": "Pass123!"
    }).json()["access_token"]
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    res = client.delete("/api/vehicles/1", headers=mgr_headers)
    assert res.status_code == 403


# ---- Admin Full Access ----

def test_admin_can_create_vehicle(client):
    """Admin can create vehicles."""
    headers = _admin_headers(client)
    res = client.post("/api/vehicles/", json={
        "make": "Audi", "model": "RS7", "category": "Sedan",
        "price": 200000000.0, "quantity": 2
    }, headers=headers)
    assert res.status_code == 201


def test_admin_can_delete_vehicle(client):
    """Admin can delete vehicles."""
    headers = _admin_headers(client)
    create_res = client.post("/api/vehicles/", json={
        "make": "Del", "model": "Admin", "category": "SUV",
        "price": 100000000.0, "quantity": 1
    }, headers=headers)
    v_id = create_res.json()["id"]
    res = client.delete(f"/api/vehicles/{v_id}", headers=headers)
    assert res.status_code == 200


def test_admin_can_manage_users(client):
    """Admin can list all users."""
    headers = _admin_headers(client)
    res = client.get("/api/users/", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_admin_can_view_all_orders(client):
    """Admin can view all customer orders."""
    headers = _admin_headers(client)
    res = client.get("/api/orders/all", headers=headers)
    assert res.status_code == 200


# ---- Unauthenticated Access ----

def test_unauthenticated_cannot_view_vehicles(client):
    """Requests without auth header are rejected."""
    res = client.get("/api/vehicles/")
    assert res.status_code in (401, 403)


def test_unauthenticated_cannot_checkout(client):
    """Unauthenticated users cannot place orders."""
    res = client.post("/api/orders/checkout", json={
        "shipping_address": "Hacker Lane",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "items": [{"vehicle_id": 1, "quantity": 1}]
    })
    assert res.status_code in (401, 403)


def test_invalid_token_rejected(client):
    """A forged token should be rejected."""
    headers = {"Authorization": "Bearer totally.invalid.token"}
    res = client.get("/api/vehicles/", headers=headers)
    assert res.status_code in (401, 403)
