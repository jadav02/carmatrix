# CarMatrix — Dealership Management & Luxury Vehicle Storefront 🚗

![CarMatrix License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-19-cyan)
![Tests](https://img.shields.io/badge/Pytest-46%2F46%20Passed-brightgreen)

CarMatrix is a modern, full-stack Dealership Management System (DMS) built with **FastAPI**, **React 19**, and **SQLite**. It features Role-Based Access Control (RBAC), a luxury vehicle storefront with shopping cart & direct checkout, UPI QR & Bank Transfer payment options with screenshot upload proof, procurement cost vs. selling price profit analytics, and an executive financial reports dashboard.

---

## 🌟 Key Features

### 🛍️ 1. General User / Buyer Storefront & E-Commerce
- **Instant Access**: General users registering under the `User` role are granted **instant approval** upon registration to shop immediately.
- **Vehicle Catalog**: High-definition car photo cards, search by make or model name, filter by category (Sedan, SUV, Coupe, Electric, etc.), and sort by price (Low to High, High to Low).
- **Pricing Format**: All vehicle prices above ₹10,00,00,000 INR formatted cleanly in Indian Rupees (`₹`).
- **Shopping Cart & Direct Checkout**:
  - **Add to Cart** and **Buy Now** actions directly on product images/cards.
  - Interactive Shopping Cart with item quantity adjustment, total calculation, and top navigation badge counter.
- **Flexible Payment Methods**:
  - **UPI Payment**: Displays dealership QR Code (`9408578951@upi`), ₹1,00,000 token amount deduction, balance due calculation, and payment screenshot image upload proof.
  - **Bank Transfer**: Displays dealership bank account details (Acc: `12345678901`, IFSC: `IFSC0012131`), option to choose **Token Amount (₹1,00,000)** or **Full Payment**, and screenshot upload proof.
- **Customer Purchase History**: View past orders (`/my-orders`), item breakdowns, payment methods, balance due, and uploaded proof thumbnails.

### 💼 2. Procurement Cost & Sale Profit Analytics
- **Dual Price Management**: Vehicle records track both **Purchase Price / Cost (₹)** (procurement cost to dealership) and **Selling Price (₹)** (customer list price).
- **Live Profit Preview**: Interactive feedback box in the vehicle modal calculating **Profit per Unit (₹)** (`Selling Price - Purchase Cost`) and **Margin Percentage (%)**.
- **Inventory Valuation**: Summary metrics displaying **Total Purchase Cost**, **Total Selling Value**, and **Potential Stock Profit**.
- **Per-Transaction Net Profit**: Automatic profit calculation on every manual sale and online customer checkout: `Profit = (Selling Price - Purchase Cost) * Quantity`.

### 🔐 3. Role-Based Access Control (RBAC) & Approval Workflow
| Role | Registration Status | Permitted Actions & Pages |
|------|---------------------|---------------------------|
| **General User / Buyer** | Instant `Approved` | Vehicle Storefront (`/`), Cart (`/cart`), Checkout (`/checkout`), Purchase History (`/my-orders`) |
| **Sales Representative** | `Pending` (Admin Approval Required) | Record Customer Sales (`/sales`), Check Vehicle Stock Availability (`/vehicles`), Sales History |
| **Inventory Manager** | `Pending` (Admin Approval Required) | Vehicle Add/Edit with Purchase/Sale Price (`/vehicles`), Restock & Purchase Stock (`/inventory`), Stock Alerts |
| **Administrator** | Pre-seeded / `Approved` | Full System Control, Staff User Approval Workflow (`/users`), Executive Financial Reports (`/reports`), All Customer Orders (`/orders/all`) |

---

## 🛠️ Technology Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic V2, SQLite, PyJWT, Passlib (Bcrypt).
- **Frontend**: React 19, Vite, Lucide React Icons, Vanilla CSS with custom CSS token design system & dark/light theme support.
- **Testing**: Pytest with FastAPI TestClient (46 automated tests).

---

## 🤖 My AI Usage (Mandatory Kata Section)

### AI Tools Used
- **Antigravity AI / Gemini 3.5 Pro**: Used as an agentic AI coding assistant for system architecture design, code generation, TDD test suite development, refactoring, and UI design.

### How AI Was Used
1. **API Architecture & ORM Models**: Designing RESTful API endpoints (`/api/auth`, `/api/vehicles`, `/api/orders`, `/api/inventory`, `/api/sales`), SQLAlchemy database models, and JWT authentication middleware.
2. **Test-Driven Development (TDD)**: Writing 46 comprehensive Pytest unit and integration test cases covering authentication, instant user approval, staff pending approval, vehicle CRUD, inventory stock purchase/restock, order checkout, and RBAC permissions.
3. **Frontend UI & Styling**: Building the glassmorphic design system in Vanilla CSS, Sun/Moon theme toggle, responsive layout components, vehicle modal with live profit calculation, shopping cart, and UPI/Bank Transfer checkout flow.

### Workflow Reflection
Leveraging AI significantly accelerated the end-to-end development cycle. It enabled rapid iteration on complex feature requirements—such as token payments, proof uploads, dual price tracking, and multi-role dashboards—while maintaining clean code practices, SOLID design principles, and 100% test pass rate.

---

## 🚦 Complete Approval Workflow

1. **Staff Sign Up**: A new employee registers under the **Sales Representative** or **Inventory Manager** role on `/register`.
2. **Pending State**: Upon registration, staff accounts are assigned `status: "Pending"`. If the user attempts to log in immediately, access is blocked with:
   > *"Your account is currently waiting for administrator approval."*
3. **Admin Approval**: The Administrator logs in, navigates to **User Management** (`/users`), and clicks **Approve Account**.
4. **Successful Login**: The approved staff member can now log in successfully and access their role-specific dashboard.

---

## 🧪 Running Automated Tests (TDD Test Suite)

CarMatrix includes a comprehensive TDD test suite with **46 passing tests** using an in-memory SQLite test database.

```bash
cd backend
venv\Scripts\python.exe -m pytest tests/ -v --tb=short
```

### Test Coverage Highlights:
- **Authentication & RBAC**: Instant customer approval, staff pending approval, admin user management, permission enforcement (17 tests).
- **Vehicle & Inventory CRUD**: Vehicle creation with purchase/selling price, stock updates, price range filtering, summary statistics (10 tests).
- **Orders & Checkout**: UPI token payment calculation, bank transfer full payment, inventory stock reduction, insufficient stock guards, order isolation (15 tests).

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup

```bash
cd backend
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 📋 Deliverables & Checklist

- [x] **Backend API (RESTful)**: FastAPI with SQLite database & JWT authentication.
- [x] **Frontend Application**: React SPA with Tailwind/Vanilla CSS tokens, responsive design, dark/light theme switch.
- [x] **TDD Test Suite**: 46 automated tests (100% passing).
- [x] **Dark & Light Mode**: Sun / Moon icon toggle with persistent `localStorage`.
- [x] **Role-Based Access Control**: General User (buyer), Sales Rep, Inventory Manager, Administrator.
- [x] **General User E-Commerce Flow**: Catalog, Cart, UPI QR Payment with screenshot proof, Bank Transfer with token amount/full payment, Checkout, and Purchase History.
- [x] **Purchase Price & Sale Profit Calculation**: Procurement cost vs. selling price tracked per unit and per sale.
- [x] **Mandatory "My AI Usage" Section**: Detailed AI tools, usage description, and reflection.
- [x] **PROMPTS.md File**: Full prompt history in root folder.

---

## 📄 License

This project is licensed under the MIT License.
