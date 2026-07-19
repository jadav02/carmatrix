"""
Test suite for verifying POST /api/auth/login endpoint.
Tests:
1. Valid login credentials -> 200 OK + JWT access token & user details
2. Invalid password -> 401 Unauthorized
3. Invalid/non-existent email -> 401 Unauthorized
"""

import json
import urllib.request
import urllib.error


def run_login_tests(base_url: str = "http://127.0.0.1:8003/api/auth"):
    print("==========================================")
    print("Running Login Endpoint Verification Tests")
    print("==========================================")

    # 1. Register a test user first
    reg_url = f"{base_url}/register"
    user_data = {
        "name": "Test Login User",
        "email": "login_test@example.com",
        "password": "Password123!",
        "role": "user"
    }
    req = urllib.request.Request(
        reg_url,
        data=json.dumps(user_data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"[PRE-REQ] Register User: {resp.status} OK")
    except urllib.error.HTTPError as e:
        if e.code == 400:
            print("[PRE-REQ] User already registered (proceeding)")
        else:
            raise e

    # --- Test 1: Valid Login ---
    login_url = f"{base_url}/login"
    valid_payload = {
        "email": "login_test@example.com",
        "password": "Password123!"
    }
    req = urllib.request.Request(
        login_url,
        data=json.dumps(valid_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        body = json.loads(resp.read().decode("utf-8"))
        assert "access_token" in body, "Missing access_token in response"
        assert body["token_type"] == "bearer", f"Unexpected token_type: {body.get('token_type')}"
        assert body["user"]["email"] == "login_test@example.com", "User email mismatch"
        print("[OK] TEST 1 PASSED: Valid login returns 200 OK, access token, and user details.")

    # --- Test 2: Invalid Password ---
    invalid_pass_payload = {
        "email": "login_test@example.com",
        "password": "WrongPassword999!"
    }
    req = urllib.request.Request(
        login_url,
        data=json.dumps(invalid_pass_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            assert False, "Expected 401 for invalid password, got 200"
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Expected 401, got {e.code}"
        body = json.loads(e.read().decode("utf-8"))
        assert body.get("detail") == "Invalid email or password"
        print("[OK] TEST 2 PASSED: Invalid password returns 401 Unauthorized.")

    # --- Test 3: Invalid / Non-existent Email ---
    invalid_email_payload = {
        "email": "nonexistent_user_999@example.com",
        "password": "Password123!"
    }
    req = urllib.request.Request(
        login_url,
        data=json.dumps(invalid_email_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            assert False, "Expected 401 for invalid email, got 200"
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Expected 401, got {e.code}"
        body = json.loads(e.read().decode("utf-8"))
        assert body.get("detail") == "Invalid email or password"
        print("[OK] TEST 3 PASSED: Invalid email returns 401 Unauthorized.")

    print("==========================================")
    print("ALL LOGIN ENDPOINT TESTS PASSED SUCCESSFULLY!")
    print("==========================================")


if __name__ == "__main__":
    run_login_tests()
