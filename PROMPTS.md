# AI Tooling Prompts & Interaction History — CarMatrix 🤖

This file documents the AI prompt history and development iterations for the **CarMatrix Car Dealership Inventory System**.

---

## 📜 Development Trajectory & Prompts

### Phase 1: Project Setup & Core REST API Architecture
> **Prompt**: "Design and build a full-stack Car Dealership Inventory System using FastAPI and React. Implement JWT token authentication, SQLAlchemy ORM models for Users, Vehicles, Sales, and Orders with SQLite database, and role-based access control."
- **AI Output**: Generated FastAPI project structure (`app/main.py`, `app/database.py`, `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`), security utilities with JWT hashing, and initial seed data.

---

### Phase 2: Test-Driven Development (TDD Test Suite)
> **Prompt**: "Write a comprehensive Pytest test suite using FastAPI TestClient and in-memory SQLite fixtures to test authentication, instant user approval, staff pending approval, vehicle CRUD, inventory stock purchase/restock, order checkout, and RBAC permissions."
- **AI Output**: Created `conftest.py`, `test_auth_rbac.py`, `test_customer_orders.py`, `test_vehicles_inventory.py`, `test_orders_checkout.py`, and `test_rbac.py` resulting in 46 passing tests.

---

### Phase 3: Dark/Light Mode Theme System
> **Prompt**: "Add mode changing like dark mode and light mode with sun and moon symbols in the top navigation bar, with persistent storage in localStorage."
- **AI Output**: Implemented `ThemeContext.jsx`, CSS custom property design system in `index.css`, and Sun/Moon toggle button in `Navbar.jsx`.

---

### Phase 4: General User Storefront, Shopping Cart & Direct Checkout
> **Prompt**: "Create user interface for General User (Customer role) who needs to view all vehicles, sort products by price, search by name, add to cart, and checkout with billing address. General users receive instant approval upon sign up without needing admin approval."
- **AI Output**: Built `CustomerProducts.jsx`, `CartContext.jsx`, `Cart.jsx`, `Checkout.jsx`, and `CustomerOrders.jsx`.

---

### Phase 5: Payment Options (UPI QR & Bank Transfer Proof Upload)
> **Prompt**: "Add payment options for checkout: UPI with QR code 9408578951@upi (₹1,00,000 token amount, balance due calculation) and Bank Transfer with dummy account details (Acc: 12345678901, IFSC: IFSC0012131) supporting token amount or full payment. Enable screenshot image upload proof."
- **AI Output**: Updated `Checkout.jsx`, `Order` and `OrderItem` ORM models, schemas, and `order_service.py` to handle base64 image proof storage and balance due calculation.

---

### Phase 6: Procurement Cost, Selling Price & Profit Analytics
> **Prompt**: "In the add vehicle/purchase vehicle modal, add purchase price (procurement cost) and selling price (list price), then calculate unit profit and total sale profit dynamically."
- **AI Output**: Added `purchase_price` and `selling_price` columns to `Vehicle`, updated `VehicleModal.jsx` with live profit badge & margin %, updated `Vehicles.jsx`, `Inventory.jsx`, `Sales.jsx`, and `Reports.jsx`.

---

### Phase 7: AI Co-authorship & Documentation
> **Prompt**: "Generate comprehensive README.md with AI Usage section and PROMPTS.md history file as required by the Kata deliverables."
- **AI Output**: Created `README.md` and `PROMPTS.md`.
