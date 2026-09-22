# STOCKIFY – Smart Inventory Management System

A high-performance, enterprise-grade, full-stack inventory management system engineered for modern retail networks, grocery distribution hubs, and supermarket chains.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Key Features & Implemented Architecture](#key-features--implemented-architecture)
4. [Folder Structure](#folder-structure)
5. [Database Architecture (PostgreSQL)](#database-architecture-postgresql)
6. [Authentication & Role Management](#authentication--role-management)
7. [Installation & Setup](#installation--setup)
8. [Running Locally](#running-locally)
9. [Default Test Credentials](#default-test-credentials)
10. [Company & Facility Details](#company--facility-details)

---

## Project Overview
**STOCKIFY** is engineered to eliminate stock discrepancies, calculate shrinkage in real time, forecast customer demand using AI-inspired time-series curves, and streamline multi-store loss prevention investigations.

Key operational metrics and formulas implemented:
- **Shrinkage Formula**: Shrinkage = Expected Stock - Actual Stock
- **Financial Impact Formula**: Financial Impact = Missing Quantity x Product Price
- **Shrinkage Rate**: Shrinkage Percentage = (Missing Quantity / Expected Stock) x 100

All metrics on the Dashboard, Demand Forecast, Shrinkage, and Investigation screens are connected to the PostgreSQL database. When staff submit a physical audit count or a manager updates an investigation status, all calculations update dynamically.

---

## Technology Stack
- **Frontend**: React 18, Vite, React Router DOM v6, Tailwind CSS, Recharts, Lucide React.
- **Backend API**: Node.js, Express 5, CORS, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`.
- **Database**: PostgreSQL (Neon Database with hybrid connection: `@neondatabase/serverless` over WSS/HTTPS on port 443 + `pg.Pool` fallback).
- **Tooling**: `concurrently` to run backend server and frontend client simultaneously.

---

## Key Features & Implemented Architecture

### 1. Role-Based Access Control (RBAC): Manager Dominance & Staff Isolation
- **Manager (Dominant Administrator)**:
  - Full multi-store visibility and aggregate KPIs.
  - Exclusive authority to create, edit, and delete Products and Stores.
  - Exclusive control over Product Pricing (`PATCH /api/products/:id/price`). Staff attempts return HTTP 403 Forbidden.
  - Exclusive control over Official System Inventory (`PUT /api/inventory/:storeId/:productId`).
  - Exclusive authority to Review, Approve, or Reject stock adjustments submitted by store staff (`POST /api/adjustments/:id/approve` and `POST /api/adjustments/:id/reject`).
  - Exclusive access to the complete chronological System Audit Log (`/audit-log`).
  - Management of Staff accounts and store assignments (`GET /api/staff`, `PUT /api/staff/:id/assign`).

- **Inventory Staff (Store-Isolated Operator)**:
  - Strictly restricted to their assigned branch node (`req.user.storeId`).
  - All queries for stores, stock, and shrinkage automatically filter to their assigned store.
  - Read-only master catalog view (cannot add products, edit products, delete products, or alter prices).
  - Submits verified physical counts (`POST /api/inventory/physical-count`).
  - **Decoupled Workflow**: Physical counts NEVER directly mutate `inventory.actual_quantity`. Instead, counts enter `adjustment_requests` with status `PENDING_MANAGER_REVIEW`.
  - Tracks status of submissions (`PENDING_MANAGER_REVIEW`, `APPROVED`, `REJECTED`) and views manager review feedback.

### 2. Stock Adjustment Approval Workflow
- When staff counts physical inventory, any difference (`physical_quantity - system_quantity`) creates an adjustment request.
- The manager dashboard displays an alert banner showing the count of pending adjustments.
- From the Investigation Desk (`/investigation`), managers review product details, expected vs counted quantities, discrepancy reasons, and staff notes.
- **Approval**: Manager accepts physical count; system updates `inventory.actual_quantity`, marks request as `APPROVED`, and writes an `ADJUSTMENT_APPROVED` audit log.
- **Rejection**: Manager rejects request; inventory remains unchanged, request is marked `REJECTED`, and an `ADJUSTMENT_REJECTED` audit log is recorded with manager feedback.

### 3. Comprehensive System Audit Ledger (`/audit-log`)
- Complete audit trail tracking critical mutations:
  - `PRICE_UPDATED`
  - `STOCK_ADJUSTED`
  - `PHYSICAL_COUNT_SUBMITTED`
  - `ADJUSTMENT_APPROVED`
  - `ADJUSTMENT_REJECTED`
  - `STORE_CREATED`, `STORE_UPDATED`, `STORE_DELETED`
  - `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`
  - `STAFF_ASSIGNED`
  - `INVESTIGATION_RESOLVED`
- Filterable by action type, target entity, user, and date range.

### 4. Dynamic Visualizations & Analytics
- Multi-store and store-level live KPI summary cards.
- Dynamic Shrinkage Pie Chart (Normal Stock vs Discrepancy vs Safety Buffer).
- 14-day historical sales and 7-day predicted demand forecasting curves.
- Store-wise comparative shrinkage breakdown.

---

## Folder Structure

```
STOCKIFY-INVENTORY-MANAGEMENT/
├── public/
│   └── favicon.svg                  # Brand SVG vector icon
├── server/
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification, managerOnly & staffOnly guards
│   ├── routes/
│   │   └── auth.js                  # Authentication routes (/login, /register, /me, /staff)
│   ├── db.js                        # Hybrid PostgreSQL connection (Neon serverless + pg Pool)
│   ├── initDb.js                    # Database schema creator and seeder script
│   ├── schema.sql                   # DDL table definitions
│   ├── seed.sql                     # Initial seed dataset (stores, products, users)
│   └── server.js                    # Express API server (Stores, Products, Inventory, Analytics)
├── src/
│   ├── assets/                      # Static brand assets and graphics
│   ├── components/
│   │   ├── common/                  # Reusable UI primitives (Badge, StatCard, StoreSelector, etc.)
│   │   ├── landing/                 # Landing-page modals (LoginModal, RegisterModal, SignInModal)
│   │   └── layout/                  # Navigation chrome (AppLayout, Navbar, Sidebar)
│   ├── context/
│   │   ├── AuthContext.jsx          # Database-backed session and user context
│   │   └── InventoryContext.jsx     # Dynamic database-backed inventory state and methods
│   ├── pages/
│   │   ├── DashboardPage.jsx        # Dynamic cards, pie chart, and store performance
│   │   ├── DemandForecastPage.jsx   # Store & product demand graph (Historical vs Predicted)
│   │   ├── InvestigationPage.jsx    # Store audit desk with staff submission resolution
│   │   ├── LoginLandingPage.jsx     # Warehouse theme hero, modals, company footer
│   │   ├── ProductsPage.jsx         # Dynamic Product CRUD management
│   │   ├── ShrinkagePage.jsx        # Total shrinkage %, store breakdown & High Shrinkage table
│   │   ├── StaffPortalPage.jsx      # Dedicated Staff stock count audit and movement portal
│   │   └── StoresPage.jsx           # Dynamic Store CRUD management
│   ├── services/
│   │   ├── api.js                   # Unified API fetch client with JWT Bearer attachment
│   │   └── inventoryService.js      # Service layer connected to backend endpoints
│   ├── utils/
│   │   ├── constants.js             # Company contact info, roles, and status codes
│   │   └── formatters.js            # Currency (INR ₹), numbers, percentages, dates
│   ├── App.jsx                      # Protected route definitions
│   ├── index.css                    # Tailwind directives & styles
│   └── main.jsx                     # Application root render
├── .env                             # Active environment variables (Database URL, JWT Secret, Port)
├── .env.example                     # Environment configuration template
├── index.html                       # HTML5 entry with Inter font
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Theme styling
└── vite.config.js                   # Vite configuration with /api backend proxy
```

---

## Database Architecture (PostgreSQL)

The database schema consists of:
1. `stores`: Store ID, code, name, location, address, manager name, phone number, created_at.
2. `products`: Product ID, SKU, name, short name, category, unit, price, barcode, min_safe_stock, created_at.
3. `store_inventory`: Composite key (`store_id`, `product_id`), expected_quantity, actual_quantity, investigation_status, notes, last_updated.
4. `users`: User ID, username, email, password_hash, role (`manager` / `staff`), store_id, full_name, phone, status, created_at.
5. `staff_submissions`: Audit ID, store_id, user_id, product_id, physical_count, expected_count, discrepancy, discrepancy_reason, notes, status (`PENDING` / `RESOLVED`), submitted_at.
6. `daily_sales`: Store ID, product ID, sale_date, units_sold, revenue.

---

## Installation & Setup

### Prerequisites
- **Node.js** version 18.0.0 or higher.
- **npm** (bundled with Node.js).

### Step 1: Clone or Unzip
Navigate to the project folder:
```bash
cd STOCKIFY-INVENTORY-MANAGEMENT
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
The `.env` file is already configured with the PostgreSQL connection string and JWT secret:
```ini
DATABASE_URL="postgresql://neondb_owner:npg_uBfTgI5o8xpd@ep-restless-union-a55h3sdw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="stockify_super_secret_key_2026"
PORT=5000
VITE_API_BASE_URL="/api"
VITE_USE_MOCK_DATA="false"
```

### Step 4: Initialize Database (If Needed)
To re-run migrations and reset seed data at any time:
```bash
npm run db:init
```

---

## Running Locally

To run both the **Backend API server (Port 5000)** and **Frontend Vite client (Port 3000)** concurrently with a single command:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000/
```

### Individual Commands
- Run backend server only: `npm run server`
- Run frontend client only: `npm run client`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`

---

## Default Test Credentials

| Role | Username | Password | Access / Landing |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager` | `password123` | Full Dashboard, Stores, Products, Investigation, Analytics |
| **Inventory Staff** | `staff.vellore` | `password123` | Store-isolated `/staff` Audit & Movement Portal |

You can also register any new Manager or Staff account directly via the UI modal on `http://localhost:3000/`.

---

## Company & Facility Details
- **Company**: Stockify Technologies
- **Regional Branch**: Stockify Inventory Solutions, Vellore, Tamil Nadu, India
- **Contact**: +91 98765 43210
- **Central Distribution**: Stockify Central Inventory Facility, Vellore, Tamil Nadu, India
