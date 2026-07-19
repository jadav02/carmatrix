"""
Test suite for verifying Inventory endpoints:
1. RESTOCK: POST /api/inventory/restock (increases stock level)
2. PURCHASE: POST /api/inventory/purchase (decreases stock level)
3. PREVENT NEGATIVE STOCK: POST /api/inventory/purchase with qty > stock (returns 400 Bad Request)
4. MISSING VEHICLE: POST /api/inventory/purchase with bad ID (returns 404 Not Found)
5. GET INVENTORY: GET /api/inventory (returns list of vehicles with stock levels)
"""

import json
import urllib.request
import urllib.error


def run_inventory_tests(base_url: str = "http://127.0.0.1:8007/api"):
    print("==========================================")
    print("Running Inventory Endpoint Verification Tests")
    print("==========================================")

    # 1. Register & Login
    user_data = {"name": "Inv Manager", "email": "inv_mgr@example.com", "password": "Password123!"}
    reg_req = urllib.request.Request(f"{base_url}/auth/register", data=json.dumps(user_data).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(reg_req) as resp:
            pass
    except urllib.error.HTTPError:
        pass

    login_req = urllib.request.Request(f"{base_url}/auth/login", data=json.dumps({"email": "inv_mgr@example.com", "password": "Password123!"}).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(login_req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        token = body["access_token"]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 2. Create a test vehicle with quantity = 5
    v_data = {"make": "Tesla", "model": "Model 3", "category": "Electric", "price": 42000.0, "quantity": 5}
    req = urllib.request.Request(f"{base_url}/vehicles/", data=json.dumps(v_data).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        v = json.loads(resp.read().decode("utf-8"))
        vid = v["id"]
        print(f"[SETUP] Created vehicle ID {vid} with initial quantity 5.")

    # 3. Test RESTOCK (+3)
    restock_payload = {"vehicle_id": vid, "quantity": 3}
    req = urllib.request.Request(f"{base_url}/inventory/restock", data=json.dumps(restock_payload).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        res = json.loads(resp.read().decode("utf-8"))
        assert res["new_quantity"] == 8
        print("[OK] TEST 1 PASSED: Restock increased quantity from 5 to 8.")

    # 4. Test PURCHASE (-2)
    purchase_payload = {"vehicle_id": vid, "quantity": 2}
    req = urllib.request.Request(f"{base_url}/inventory/purchase", data=json.dumps(purchase_payload).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        res = json.loads(resp.read().decode("utf-8"))
        assert res["new_quantity"] == 6
        print("[OK] TEST 2 PASSED: Purchase decreased quantity from 8 to 6.")

    # 5. Test PREVENT NEGATIVE STOCK (Attempting to purchase 100 when only 6 available)
    over_purchase_payload = {"vehicle_id": vid, "quantity": 100}
    req = urllib.request.Request(f"{base_url}/inventory/purchase", data=json.dumps(over_purchase_payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            assert False, "Expected 400 Bad Request for over-purchase"
    except urllib.error.HTTPError as e:
        assert e.code == 400
        err_body = json.loads(e.read().decode("utf-8"))
        assert "Insufficient stock" in err_body["detail"]
        print("[OK] TEST 3 PASSED: Excessive purchase blocked with 400 Bad Request (Insufficient stock).")

    # 6. Test MISSING VEHICLE (vehicle_id = 99999)
    bad_id_payload = {"vehicle_id": 99999, "quantity": 1}
    req = urllib.request.Request(f"{base_url}/inventory/purchase", data=json.dumps(bad_id_payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            assert False, "Expected 404 Not Found"
    except urllib.error.HTTPError as e:
        assert e.code == 404
        print("[OK] TEST 4 PASSED: Non-existent vehicle transaction returned 404 Not Found.")

    # 7. Test GET /api/inventory
    req = urllib.request.Request(f"{base_url}/inventory", headers=headers)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        inv_list = json.loads(resp.read().decode("utf-8"))
        assert len(inv_list) > 0
        print(f"[OK] TEST 5 PASSED: GET /api/inventory returned listing of {len(inv_list)} vehicles.")

    print("==========================================")
    print("ALL INVENTORY TESTS PASSED SUCCESSFULLY!")
    print("==========================================")


if __name__ == "__main__":
    run_inventory_tests()
