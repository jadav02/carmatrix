# ==========================================
# Authentication & Role-Based Access Control (RBAC) Tests
# ==========================================

import pytest

def test_customer_registration_instant_approval(client):
    """General Users ('customer') get instant Approved status and can log in immediately."""
    reg_res = client.post("/api/auth/register", json={
        "name": "General User John",
        "email": "john.buyer@example.com",
        "password": "Password123!",
        "role": "customer"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["user"]["status"] == "Approved"

    # Immediate login check
    login_res = client.post("/api/auth/login", json={
        "email": "john.buyer@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["role"] == "customer"


def test_staff_registration_requires_admin_approval(client):
    """Staff roles ('sales', 'manager') require Admin approval and login is blocked while Pending."""
    reg_res = client.post("/api/auth/register", json={
        "name": "Sales Rep Sara",
        "email": "sara.sales@example.com",
        "password": "Password123!",
        "role": "sales"
    })
    assert reg_res.status_code == 201
    assert reg_res.json()["user"]["status"] == "Pending"

    # Login while pending must return 403 Forbidden
    login_res = client.post("/api/auth/login", json={
        "email": "sara.sales@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 403
    assert "waiting for administrator approval" in login_res.json()["detail"]


def test_admin_approve_user(client):
    """Administrator can view all users and approve pending staff accounts."""
    # 1. Register pending manager
    client.post("/api/auth/register", json={
        "name": "Manager Mike",
        "email": "mike.manager@example.com",
        "password": "Password123!",
        "role": "manager"
    })

    # 2. Login as Admin
    admin_login = client.post("/api/auth/login", json={
        "email": "admin.test@carmatrix.com",
        "password": "AdminPass123!"
    })
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Get users list
    users_res = client.get("/api/users/", headers=headers)
    assert users_res.status_code == 200
    users = users_res.json()
    target = next(u for u in users if u["email"] == "mike.manager@example.com")
    assert target["status"] == "Pending"

    # 4. Approve user
    app_res = client.put(f"/api/users/{target['id']}/status", json={"status": "Approved"}, headers=headers)
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "Approved"

    # 5. Now Manager Mike can log in successfully!
    mike_login = client.post("/api/auth/login", json={
        "email": "mike.manager@example.com",
        "password": "Password123!"
    })
    assert mike_login.status_code == 200


def test_rbac_access_denied_for_non_admin(client):
    """Customers/Non-Admins cannot access Admin endpoints like user management."""
    # Register and login customer
    client.post("/api/auth/register", json={
        "name": "Customer User",
        "email": "cust.rbac@example.com",
        "password": "Password123!",
        "role": "customer"
    })
    cust_login = client.post("/api/auth/login", json={
        "email": "cust.rbac@example.com",
        "password": "Password123!"
    })
    cust_token = cust_login.json()["access_token"]

    # Try accessing /api/users/ as customer -> 403 Forbidden
    res = client.get("/api/users/", headers={"Authorization": f"Bearer {cust_token}"})
    assert res.status_code == 403
