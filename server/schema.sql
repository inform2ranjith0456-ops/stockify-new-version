-- STOCKIFY DATABASE SCHEMA

-- STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    address TEXT,
    manager VARCHAR(100),
    phone VARCHAR(30),
    active_racks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100),
    category VARCHAR(100),
    unit VARCHAR(50),
    price NUMERIC(12,2) DEFAULT 0,
    barcode VARCHAR(100),
    min_safe_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- USERS TABLE (Managers and Staff)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MANAGER', -- 'MANAGER' or 'STAFF'
    role_id VARCHAR(50), -- e.g. MGR-4401 or STF-8820
    store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL, -- Assigned store for staff
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW()
);

-- INVENTORY TABLE (Store-Product Mapping)
CREATE TABLE IF NOT EXISTS inventory (
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    expected_quantity NUMERIC(12,2) DEFAULT 0,
    actual_quantity NUMERIC(12,2) DEFAULT 0,
    investigation_status VARCHAR(50) DEFAULT 'PENDING',
    last_updated TIMESTAMP DEFAULT NOW(),
    notes TEXT,

    PRIMARY KEY (store_id, product_id)
);

-- DEMAND FORECASTS TABLE
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    actual_quantity NUMERIC(12,2),
    predicted_quantity NUMERIC(12,2),
    lower_bound NUMERIC(12,2),
    upper_bound NUMERIC(12,2)
);

-- STOCK RECONCILIATIONS / AUDIT INVESTIGATIONS TABLE
CREATE TABLE IF NOT EXISTS stock_reconciliations (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    manager_count NUMERIC(12,2) NOT NULL,
    manager_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    manager_confidence NUMERIC(5,2) DEFAULT 95.0,

    staff_count NUMERIC(12,2) NOT NULL,
    staff_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    staff_confidence NUMERIC(5,2) DEFAULT 90.0,

    movement_quantity NUMERIC(12,2) DEFAULT 0,
    movement_type VARCHAR(50),
    movement_timestamp TIMESTAMP,

    status VARCHAR(50) DEFAULT 'PENDING',

    final_count NUMERIC(12,2),
    reviewer VARCHAR(100),
    reviewed_at TIMESTAMP,
    reason TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- STAFF AUDIT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS staff_submissions (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    staff_username VARCHAR(100),
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    expected_quantity NUMERIC(12,2) NOT NULL,
    actual_quantity NUMERIC(12,2) NOT NULL,
    damaged_quantity NUMERIC(12,2) DEFAULT 0,
    missing_quantity NUMERIC(12,2) NOT NULL,
    shrinkage_reason VARCHAR(100),
    notes TEXT,
    movement_type VARCHAR(50),
    movement_quantity NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- STOCK ADJUSTMENT REQUESTS TABLE (Staff Submission -> Manager Approval Workflow)
CREATE TABLE IF NOT EXISTS adjustment_requests (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    staff_username VARCHAR(100),
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    system_quantity NUMERIC(12,2) NOT NULL,
    physical_quantity NUMERIC(12,2) NOT NULL,
    difference NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    movement_type VARCHAR(50),
    movement_quantity NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING_MANAGER_REVIEW', -- 'PENDING_MANAGER_REVIEW', 'APPROVED', 'REJECTED'
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by_username VARCHAR(100),
    reviewed_at TIMESTAMP,
    manager_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOGS TABLE (Complete System Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- PRICE_UPDATED, STOCK_ADJUSTED, PHYSICAL_COUNT_SUBMITTED, etc.
    entity_type VARCHAR(100),     -- PRODUCT, STORE, INVENTORY, ADJUSTMENT, USER, etc.
    entity_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);