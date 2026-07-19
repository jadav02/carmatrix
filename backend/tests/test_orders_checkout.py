# ==========================================
# Order, Checkout & Purchase History Tests
# ==========================================
# Tests the customer order flow: checkout, payment methods,
# purchase history, stock reduction, and order isolation.

import pytest


def _customer_headers(client, email="customer@example.com"):
    """Helper: Register/login as a customer and return auth headers."""
    client.post("/api/auth/register", json={
        "name": "Test Customer", "email": email,
        "password": "Pass123!", "role": "customer"
    })
    token = client.post("/api/auth/login", json={
        "email": email, "password": "Pass123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _admin_headers(client):
    """Helper: Login as seeded admin and return auth headers."""
    token = client.post("/api/auth/login", json={
        "email": "admin.test@carmatrix.com",
        "password": "AdminPass123!"
    }).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_checkout_upi_token_payment(client):
    """Customer checkout using UPI pays ₹1,00,000 token amount."""
    headers = _customer_headers(client)

    vehicles = client.get("/api/vehicles/", headers=headers).json()
    assert len(vehicles) >= 1
    v_id = vehicles[0]["id"]
    v_price = vehicles[0]["price"]

    payload = {
        "shipping_address": "123 Test St, Mumbai - 400001",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        "items": [{"vehicle_id": v_id, "quantity": 1}]
    }
    res = client.post("/api/orders/checkout", json=payload, headers=headers)
    assert res.status_code == 201
    order = res.json()
    assert order["payment_method"] == "UPI Payment"
    assert order["amount_paid"] == 100000.0
    assert order["balance_due"] == max(0.0, round(v_price - 100000.0, 2))
    assert order["payment_proof"] is not None


def test_checkout_bank_transfer_full_payment(client):
    """Customer checkout using Bank Transfer with Full Payment."""
    headers = _customer_headers(client, email="bank_full@example.com")

    vehicles = client.get("/api/vehicles/", headers=headers).json()
    v_id = vehicles[0]["id"]
    v_price = vehicles[0]["price"]

    payload = {
        "shipping_address": "456 Bank Road, Delhi - 110001",
        "payment_method": "Bank Transfer",
        "payment_type": "Full Payment",
        "payment_proof": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        "items": [{"vehicle_id": v_id, "quantity": 1}]
    }
    res = client.post("/api/orders/checkout", json=payload, headers=headers)
    assert res.status_code == 201
    order = res.json()
    assert order["amount_paid"] == v_price
    assert order["balance_due"] == 0.0


def test_checkout_reduces_inventory_stock(client):
    """Checkout reduces the vehicle stock in the database."""
    headers = _customer_headers(client, email="stock_test@example.com")

    vehicles = client.get("/api/vehicles/", headers=headers).json()
    v_before = vehicles[0]
    initial_qty = v_before["quantity"]

    client.post("/api/orders/checkout", json={
        "shipping_address": "Stock Test Address",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "proof_url",
        "items": [{"vehicle_id": v_before["id"], "quantity": 1}]
    }, headers=headers)

    vehicles_after = client.get("/api/vehicles/", headers=headers).json()
    v_after = next(v for v in vehicles_after if v["id"] == v_before["id"])
    assert v_after["quantity"] == initial_qty - 1


def test_checkout_insufficient_stock_fails(client):
    """Purchasing more units than available stock returns 400."""
    headers = _customer_headers(client, email="overbuy@example.com")

    vehicles = client.get("/api/vehicles/", headers=headers).json()
    v_info = vehicles[0]

    res = client.post("/api/orders/checkout", json={
        "shipping_address": "Overbuy Street",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "proof",
        "items": [{"vehicle_id": v_info["id"], "quantity": 999}]
    }, headers=headers)
    assert res.status_code == 400
    assert "Insufficient stock" in res.json()["detail"]


def test_checkout_empty_items_fails(client):
    """Checkout with empty items list should fail validation (422)."""
    headers = _customer_headers(client, email="empty_cart@example.com")
    payload = {
        "shipping_address": "456 Empty St",
        "payment_method": "Bank Transfer",
        "payment_type": "Full Payment",
        "items": []
    }
    res = client.post("/api/orders/checkout", json=payload, headers=headers)
    assert res.status_code == 422


def test_checkout_invalid_vehicle_fails(client):
    """Checkout with a non-existent vehicle ID should fail."""
    headers = _customer_headers(client, email="bad_vehicle@example.com")
    payload = {
        "shipping_address": "789 Bad Vehicle St",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "proof",
        "items": [{"vehicle_id": 99999, "quantity": 1}]
    }
    res = client.post("/api/orders/checkout", json=payload, headers=headers)
    assert res.status_code in (400, 404)


def test_purchase_history_returns_orders(client):
    """Customer can view their purchase history via /my-orders."""
    headers = _customer_headers(client, email="history@example.com")

    vehicles = client.get("/api/vehicles/", headers=headers).json()
    v_id = vehicles[0]["id"]

    client.post("/api/orders/checkout", json={
        "shipping_address": "501 MG Road, Bengaluru",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "proof_data_url",
        "items": [{"vehicle_id": v_id, "quantity": 1}]
    }, headers=headers)

    res = client.get("/api/orders/my-orders", headers=headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history) >= 1
    assert history[0]["shipping_address"] == "501 MG Road, Bengaluru"
    assert history[0]["payment_proof"] == "proof_data_url"


def test_purchase_history_empty_for_new_customer(client):
    """New customer with no orders gets an empty history."""
    headers = _customer_headers(client, email="newcust@example.com")
    res = client.get("/api/orders/my-orders", headers=headers)
    assert res.status_code == 200
    assert res.json() == []


def test_order_isolation_between_customers(client):
    """Customer A cannot see Customer B's orders."""
    headers_a = _customer_headers(client, email="alice@example.com")
    headers_b = _customer_headers(client, email="bob@example.com")

    vehicles = client.get("/api/vehicles/", headers=headers_a).json()
    if vehicles:
        client.post("/api/orders/checkout", json={
            "shipping_address": "Alice's Place",
            "payment_method": "UPI Payment",
            "payment_type": "Token Payment",
            "payment_proof": "alice_proof",
            "items": [{"vehicle_id": vehicles[0]["id"], "quantity": 1}]
        }, headers=headers_a)

    # Bob's history should not contain Alice's order
    bob_history = client.get("/api/orders/my-orders", headers=headers_b).json()
    assert isinstance(bob_history, list)
    assert len(bob_history) == 0


def test_admin_can_view_all_orders(client):
    """Admin can view all customer orders via /all endpoint."""
    # First place an order as a customer
    cust_headers = _customer_headers(client, email="admin_view_test@example.com")
    vehicles = client.get("/api/vehicles/", headers=cust_headers).json()
    if vehicles:
        client.post("/api/orders/checkout", json={
            "shipping_address": "Admin View Test",
            "payment_method": "Bank Transfer",
            "payment_type": "Token Payment",
            "payment_proof": "proof",
            "items": [{"vehicle_id": vehicles[0]["id"], "quantity": 1}]
        }, headers=cust_headers)

    # Admin views all orders
    admin_h = _admin_headers(client)
    res = client.get("/api/orders/all", headers=admin_h)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    if vehicles:
        assert len(res.json()) >= 1
