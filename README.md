# CarMatrix — Dealership Management & Luxury Vehicle Storefront 🚗

![CarMatrix License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-19-cyan)
![Tests](https://img.shields.io/badge/Pytest-46%2F46%20Passed-brightgreen)

CarMatrix is a modern, full-stack Dealership Management System (DMS) built with **FastAPI**, **React 19**, and **SQLite**. It features Role-Based Access Control (RBAC), a luxury vehicle storefront with shopping cart & direct checkout, UPI QR & Bank Transfer payment options with screenshot upload proof, procurement cost vs. selling price profit analytics, and an executive financial reports dashboard.

---

## 🏗️ Project Architecture & Design System

```
                          ┌─────────────────────────────┐
                          │   React 19 SPA (Vite)       │
                          │   - Storefront & Catalog    │
                          │   - Shopping Cart & Checkout│
                          │   - Staff & Admin Portals   │
                          └──────────────┬──────────────┘
                                         │ HTTP / REST API
                                         ▼
                          ┌─────────────────────────────┐
                          │    FastAPI REST Backend     │
                          │   - JWT Auth & Security     │
                          │   - RBAC Router Guards      │
                          │   - Profit Calculation      │
                          └──────────────┬──────────────┘
                                         │ ORM Layer
                                         ▼
                          ┌─────────────────────────────┐
                          │     SQLite Database         │
                          │  (users, vehicles, sales,   │
                          │     orders, order_items)    │
                          └─────────────────────────────┘
```

---

## 📂 Folder Structure

```
car-dealership/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, dependencies, JWT hashing
│   │   ├── models/         # SQLAlchemy ORM models (User, Vehicle, Sale, Order)
│   │   ├── routers/        # FastAPI endpoints (auth, vehicles, inventory, sales, orders, users)
│   │   ├── schemas/        # Pydantic V2 request/response schemas
│   │   ├── services/       # Business logic layer
│   │   ├── config.py       # System settings & environment configuration
│   │   ├── database.py     # Database engine & session maker
│   │   └── main.py         # Application entry point & lifespan migrations
│   ├── tests/              # Pytest TDD test suite (46 passing tests)
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/            # API client modules
│   │   ├── components/     # Reusable UI components (Navbar, Sidebar, VehicleModal, etc.)
│   │   ├── context/        # AuthContext, ThemeContext, CartContext
│   │   ├── pages/          # Dashboard, CustomerProducts, Cart, Checkout, Vehicles, Sales, Reports
│   │   ├── utils/          # Formatters (INR currency, dates)
│   │   ├── App.jsx         # Router & ProtectedRoute RBAC configuration
│   │   └── index.css       # Design tokens & glassmorphic themes
├── AI_USAGE.md             # AI Tools, generated code, and workflow report
├── PROMPTS.md              # AI prompt history & development milestones
└── README.md               # Project documentation
```

---

## 🌟 Key Features & Role-Based Access Control (RBAC)

### Default Administrator Credentials
- **Email**: `admin@carmatrix.com`
- **Password**: `Admin123!`
- **Role**: `admin`

### Role Access Matrix

| Role | Registration Status | Permitted Actions & Pages |
|------|---------------------|---------------------------|
| **General User / Buyer** | Instant `Approved` | Vehicle Storefront (`/`), Cart (`/cart`), Checkout (`/checkout`), Purchase History (`/my-orders`) |
| **Sales Representative** | `Pending` (Admin Approval Required) | Record Customer Sales (`/sales`), Check Vehicle Stock Availability (`/vehicles`), Sales History |
| **Inventory Manager** | `Pending` (Admin Approval Required) | Vehicle Add/Edit with Purchase/Sale Price (`/vehicles`), Restock & Purchase Stock (`/inventory`), Stock Alerts |
| **Administrator** | Pre-seeded / `Approved` | Full System Control, Staff User Approval Workflow (`/users`), Executive Financial Reports (`/reports`), All Customer Orders (`/orders/all`) |

---

## 🛠️ Technology Stack & Environment Variables

- **Backend**: Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic V2, SQLite, PyJWT, Passlib (Bcrypt).
- **Frontend**: React 19, Vite, Lucide React Icons, Vanilla CSS with custom CSS token design system & dark/light theme support.
- **Environment Variables**:
  - `SECRET_KEY`: Secret key for JWT signing (default: `carmatrix_super_secret_jwt_key_2026`).
  - `VITE_API_BASE_URL`: Frontend backend API URL (default: `http://localhost:8000/api`).

---

## 🚀 Quickstart & Installation Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Running Automated Tests (TDD Test Suite)

CarMatrix includes a comprehensive TDD test suite with **46 passing tests** using an in-memory SQLite test database.

```bash
cd backend
venv\Scripts\python.exe -m pytest tests/ -v --tb=short
```

---

## 🤖 My AI Usage (Mandatory Kata Section)

Please see [AI_USAGE.md](file:///d:/car-dealership/AI_USAGE.md) and [PROMPTS.md](file:///d:/car-dealership/PROMPTS.md) for full details on AI tooling, generated code, manual refactoring, testing, and interaction history.

---

## 🔮 Future Improvements

1. **Email Notifications**: Automated email receipts sent to customers upon order placement.
2. **Payment Gateway Integration**: Direct Stripe / Razorpay API integration for credit card processing.
3. **Advanced Analytics**: Visual sales trends and profit forecasting charts using Recharts.
