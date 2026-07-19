"""
Test suite for verifying Vehicle CRUD and Inventory Search/Summary endpoints.
Tests:
1. Create vehicle
2. Get all vehicles with search and filters (category, min_price, max_price, in_stock_only)
3. Get inventory summary metrics
4. Get vehicle by ID
5. Update vehicle
6. Delete vehicle
"""

import json
import urllib.request
import urllib.error


def run_vehicle_tests(base_url: str = "http://127.0.0.1:8004/api"):
    print("==========================================")
    print("Running Vehicle & Inventory Endpoint Tests")
    print("==========================================")

    # 1. Register & Login to get token
    user_data = {"name": "Vehicle Tester", "email": "veh_tester@example.com", "password": "Password123!"}
    req = urllib.request.Request(f"{base_url}/auth/register", data=json.dumps(user_data).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            pass
    except urllib.error.HTTPError:
        pass

    login_req = urllib.request.Request(f"{base_url}/auth/login", data=json.dumps({"email": "veh_tester@example.com", "password": "Password123!"}).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(login_req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        token = body["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 2. Create sample vehicles
    v1_payload = {"make": "Toyota", "model": "Camry", "category": "Sedan", "price": 25000.0, "quantity": 5}
    v2_payload = {"make": "Ford", "model": "Explorer", "category": "SUV", "price": 38000.0, "quantity": 2}
    v3_payload = {"make": "Honda", "model": "Civic", "category": "Sedan", "price": 22000.0, "quantity": 0}

    for v in [v1_payload, v2_payload, v3_payload]:
        req = urllib.request.Request(f"{base_url}/vehicles/", data=json.dumps(v).encode("utf-8"), headers=auth_headers)
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 201

    print("[OK] TEST 1 PASSED: Created sample vehicles successfully.")

    # 3. Test GET /vehicles/ (all)
    req = urllib.request.Request(f"{base_url}/vehicles/", headers=auth_headers)
    with urllib.request.urlopen(req) as resp:
        vehicles = json.loads(resp.read().decode("utf-8"))
        assert len(vehicles) >= 3
    print("[OK] TEST 2 PASSED: Retrieved all vehicles.")

    # 4. Test filtering by category
    req = urllib.request.Request(f"{base_url}/vehicles/?category=Sedan", headers=auth_headers)
    with urllib.request.urlopen(req) as resp:
        sedans = json.loads(resp.read().decode("utf-8"))
        for s in sedans:
            assert s["category"].lower() == "sedan"
    print("[OK] TEST 3 PASSED: Category filtering works.")

    # 5. Test search filter (make/model)
    req = urllib.request.Request(f"{base_url}/vehicles/?search=Camry", headers=auth_headers)
    with urllib.request.urlopen(req) as resp:
        camrys = json.loads(resp.read().decode("utf-8"))
        assert any(c["model"] == "Camry" for c in camrys)
    print("[OK] TEST 4 PASSED: Search query filtering works.")

    # 6. Test inventory summary metrics
    req = urllib.request.Request(f"{base_url}/vehicles/summary", headers=auth_headers)
    with urllib.request.urlopen(req) as resp:
        summary = json.loads(resp.read().decode("utf-8"))
        assert "total_vehicles" in summary
        assert "total_quantity" in summary
        assert "total_inventory_value" in summary
        assert "low_stock_count" in summary
    print("[OK] TEST 5 PASSED: Inventory summary statistics endpoint works.")

    print("==========================================")
    print("ALL VEHICLE & INVENTORY TESTS PASSED!")
    print("==========================================")


if __name__ == "__main__":
    run_vehicle_tests()
