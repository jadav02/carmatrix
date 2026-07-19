# ==========================================
# Customer Purchasing, Cart & Payment Tests
# ==========================================

import pytest

def test_checkout_upi_token_payment(client):
    """Customer checkout using UPI Payment pays ₹1,00,000 Token and calculates balance due."""
    # 1. Register & login customer
    client.post("/api/auth/register", json={
        "name": "Buyer Bob",
        "email": "bob.upi@example.com",
        "password": "Password123!",
        "role": "customer"
    })
    login_res = client.post("/api/auth/login", json={
        "email": "bob.upi@example.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get available vehicle ID
    veh_res = client.get("/api/vehicles/", headers=headers)
    v_id = veh_res.json()[0]["id"]
    v_price = veh_res.json()[0]["price"]

    # 3. Checkout with UPI Token Payment and Proof
    checkout_payload = {
        "shipping_address": "104 MG Road, Indiranagar, Bengaluru - 560038",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "items": [{"vehicle_id": v_id, "quantity": 1}]
    }

    order_res = client.post("/api/orders/checkout", json=checkout_payload, headers=headers)
    assert order_res.status_code == 201
    order = order_res.json()
    assert order["payment_method"] == "UPI Payment"
    assert order["amount_paid"] == 100000.0
    assert order["balance_due"] == max(0.0, round(v_price - 100000.0, 2))
    assert order["payment_proof"] is not None


def test_checkout_bank_transfer_full_payment(client):
    """Customer checkout using Bank Transfer with Full Payment option."""
    client.post("/api/auth/register", json={
        "name": "Buyer Alice",
        "email": "alice.bank@example.com",
        "password": "Password123!",
        "role": "customer"
    })
    token = client.post("/api/auth/login", json={
        "email": "alice.bank@example.com",
        "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    veh_res = client.get("/api/vehicles/", headers=headers)
    v_id = veh_res.json()[0]["id"]
    v_price = veh_res.json()[0]["price"]

    checkout_payload = {
        "shipping_address": "204 Lavelle Road, Bengaluru - 560001",
        "payment_method": "Bank Transfer",
        "payment_type": "Full Payment",
        "payment_proof": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "items": [{"vehicle_id": v_id, "quantity": 1}]
    }

    order_res = client.post("/api/orders/checkout", json=checkout_payload, headers=headers)
    assert order_res.status_code == 201
    order = order_res.json()
    assert order["amount_paid"] == v_price
    assert order["balance_due"] == 0.0


def test_checkout_reduces_inventory_stock(client):
    """Checkout reduces stock in database for purchased vehicles."""
    client.post("/api/auth/register", json={
        "name": "Stock Test User",
        "email": "stock.test@example.com",
        "password": "Password123!",
        "role": "customer"
    })
    token = client.post("/api/auth/login", json={"email": "stock.test@example.com", "password": "Password123!"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    v_before = client.get("/api/vehicles/", headers=headers).json()[0]
    initial_qty = v_before["quantity"]

    client.post("/api/orders/checkout", json={
        "shipping_address": "Test Address",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "proof_url",
        "items": [{"vehicle_id": v_before["id"], "quantity": 2}]
    }, headers=headers)

    v_after = client.get("/api/vehicles/", headers=headers).json()[0]
    assert v_after["quantity"] == initial_qty - 2


def test_checkout_insufficient_stock_error(client):
    """Purchasing more units than available stock returns 400 Bad Request."""
    client.post("/api/auth/register", json={"name": "Overbuy User", "email": "overbuy@example.com", "password": "Password123!", "role": "customer"})
    token = client.post("/api/auth/login", json={"email": "overbuy@example.com", "password": "Password123!"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    v_info = client.get("/api/vehicles/", headers=headers).json()[0]
    
    # Try buying 999 units (more than 5 available)
    res = client.post("/api/orders/checkout", json={
        "shipping_address": "Test Address",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "proof_url",
        "items": [{"vehicle_id": v_info["id"], "quantity": 999}]
    }, headers=headers)

    assert res.status_code == 400
    assert "Insufficient stock" in res.json()["detail"]


def test_get_my_orders_purchase_history(client):
    """Customer can retrieve their purchase history with items and payment proof."""
    client.post("/api/auth/register", json={"name": "History User", "email": "history@example.com", "password": "Password123!", "role": "customer"})
    token = client.post("/api/auth/login", json={"email": "history@example.com", "password": "Password123!"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    v_id = client.get("/api/vehicles/", headers=headers).json()[0]["id"]

    client.post("/api/orders/checkout", json={
        "shipping_address": "501 MG Road, Bengaluru",
        "payment_method": "UPI Payment",
        "payment_type": "Token Payment",
        "payment_proof": "proof_data_url",
        "items": [{"vehicle_id": v_id, "quantity": 1}]
    }, headers=headers)

    orders_res = client.get("/api/orders/my-orders", headers=headers)
    assert orders_res.status_code == 200
    my_orders = orders_res.json()
    assert len(my_orders) == 1
    assert my_orders[0]["shipping_address"] == "501 MG Road, Bengaluru"
    assert my_orders[0]["payment_proof"] == "proof_data_url"
