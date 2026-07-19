# CarMatrix — Car Dealership Inventory System

CarMatrix is a full-stack web application for managing car dealership vehicle inventory, stock purchases, restocking operations, and user authentication.

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, Pydantic, JWT Authentication (Passlib, Python-Jose)
- **Frontend**: React, Vite, React Router DOM, Lucide React, Vanilla CSS Design Tokens
- **API Documentation**: OpenAPI / Swagger UI at `/docs`

## Features

- **JWT Authentication**: User registration, login, protected routes, and role-based context.
- **Vehicle CRUD**: Add, view, edit, search, filter, and delete vehicles.
- **Inventory Stock Management**: Real-time stock purchase and restock operations with validation against negative stock levels.
