-- STOCKIFY SEED DATA
-- Default passwords for all demo accounts: password123

-- 1. INSERT STORES
INSERT INTO stores (id, code, name, location, address, manager, phone, active_racks)
VALUES
  (1, 'VLR-CENTRAL', 'Vellore Central Inventory Facility', 'Vellore Main, Tamil Nadu', 'Stockify Central Inventory Facility, Phase 2 Industrial Corridor, Vellore, Tamil Nadu 632014', 'Rajesh Kumar (MGR-4401)', '+91 98401 23456', 48),
  (2, 'VLR-KATPADI', 'Katpadi Junction Retail Depot', 'Katpadi, Vellore, Tamil Nadu', 'Depot Rd, Near Katpadi Station, Katpadi, Vellore, Tamil Nadu 632007', 'Priya Sundaram (MGR-4402)', '+91 98402 34567', 32),
  (3, 'VLR-GANDHI', 'Gandhinagar Supercenter Hub', 'Gandhinagar, Vellore, Tamil Nadu', 'Main Commercial Ave, 4th Cross, Gandhinagar, Vellore, Tamil Nadu 632006', 'Ananth Narayanan (MGR-4403)', '+91 98403 45678', 36)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  address = EXCLUDED.address,
  manager = EXCLUDED.manager,
  phone = EXCLUDED.phone,
  active_racks = EXCLUDED.active_racks;

SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));

-- 2. INSERT PRODUCTS
INSERT INTO products (id, sku, name, short_name, category, unit, price, barcode, min_safe_stock)
VALUES
  (1, 'GRO-RICE-001', 'Premium Basmati Rice (5kg)', 'Rice', 'Grains & Staples', 'Bag (5kg)', 450.00, '8901030012014', 200),
  (2, 'GRO-ATTA-002', 'Whole Wheat Chakki Atta (5kg)', 'Wheat Flour', 'Grains & Staples', 'Bag (5kg)', 260.00, '8901030023025', 250),
  (3, 'GRO-COIL-003', 'Pure Refined Sunflower Cooking Oil (1L)', 'Cooking Oil', 'Edible Oils', 'Pouch (1L)', 155.00, '8901030034036', 180),
  (4, 'GRO-SUGR-004', 'Pure White Crystal Sugar (1kg)', 'Sugar', 'Essentials', 'Pack (1kg)', 48.00, '8901030045047', 300),
  (5, 'GRO-MILK-005', 'Farm Fresh Whole Milk (1L)', 'Milk', 'Dairy & Perishables', 'Carton (1L)', 64.00, '8901030056058', 150),
  (6, 'GRO-BISC-006', 'Butter Crunch Biscuits (300g)', 'Biscuits', 'Bakery & Snacks', 'Pack (300g)', 35.00, '8901030067069', 400),
  (7, 'GRO-TEA-007', 'Premium Assam CTC Black Tea (500g)', 'Tea', 'Beverages', 'Box (500g)', 210.00, '8901030078070', 150)
ON CONFLICT (id) DO UPDATE SET
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  price = EXCLUDED.price,
  barcode = EXCLUDED.barcode,
  min_safe_stock = EXCLUDED.min_safe_stock;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 3. INSERT USERS (Manager & Store-Specific Staff)
INSERT INTO users (id, username, name, email, password, role, role_id, store_id, status)
VALUES
  (1, 'manager', 'Rajesh Kumar', 'manager@stockify.io', '$2b$10$4yMqQ9fCK/Bz0JeKYxQSUOQXFxnhnKQLORYGyV42t3ixyxfxTMOJi', 'MANAGER', 'MGR-4401', NULL, 'ACTIVE'),
  (2, 'staff.vellore', 'Kavitha R', 'staff.vellore@stockify.io', '$2b$10$4yMqQ9fCK/Bz0JeKYxQSUOQXFxnhnKQLORYGyV42t3ixyxfxTMOJi', 'STAFF', 'STF-8820', 1, 'ACTIVE'),
  (3, 'staff.katpadi', 'Suresh M', 'staff.katpadi@stockify.io', '$2b$10$4yMqQ9fCK/Bz0JeKYxQSUOQXFxnhnKQLORYGyV42t3ixyxfxTMOJi', 'STAFF', 'STF-8821', 2, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  role_id = EXCLUDED.role_id,
  store_id = EXCLUDED.store_id,
  status = EXCLUDED.status;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 4. INSERT INVENTORY
-- Store 1 (Vellore Central)
INSERT INTO inventory (store_id, product_id, expected_quantity, actual_quantity, investigation_status, last_updated, notes)
VALUES
  (1, 1, 1200, 1145, 'PENDING', NOW() - INTERVAL '1 day', 'Audit variance detected on Pallet Rack A-04 during physical cycle count.'),
  (1, 2, 1500, 1470, 'COMPLETED', NOW() - INTERVAL '2 days', 'Bulk packing tear reconciled with supplier credit note.'),
  (1, 3, 900, 840, 'PENDING', NOW() - INTERVAL '1 day', 'High shrinkage detected; spillage near bay C-02 undergoing review.'),
  (1, 4, 2200, 2170, 'COMPLETED', NOW() - INTERVAL '3 days', 'Moisture humidity weight loss variance calibrated and closed.'),
  (1, 5, 800, 790, 'COMPLETED', NOW() - INTERVAL '1 day', 'Cold chain expiry discard logged per FSSAI safety norms.'),
  (1, 6, 3000, 2940, 'PENDING', NOW() - INTERVAL '1 day', 'Carton damage during forklift offloading on bay 3.'),
  (1, 7, 1100, 1085, 'COMPLETED', NOW() - INTERVAL '4 days', 'Verified against supplier dispatch invoice; zero security variance.'),

-- Store 2 (Katpadi Depot)
  (2, 1, 850, 810, 'PENDING', NOW() - INTERVAL '1 day', 'Inter-store transfer transit variance from central facility dispatch batch VLR-771.'),
  (2, 2, 950, 930, 'COMPLETED', NOW() - INTERVAL '2 days', 'Discrepancy resolved after physical recount in secondary rack.'),
  (2, 3, 600, 565, 'PENDING', NOW() - INTERVAL '1 day', 'Carton seal damaged during transport; inspection report filed.'),
  (2, 4, 1400, 1380, 'COMPLETED', NOW() - INTERVAL '3 days', 'Routine check passed; minor moisture variance acceptable.'),
  (2, 5, 500, 485, 'PENDING', NOW() - INTERVAL '1 day', 'Chiller temperature fluctuation caused stock disposal.'),
  (2, 6, 1800, 1750, 'PENDING', NOW() - INTERVAL '2 days', 'Damaged retail packaging returned by cashier counter.'),
  (2, 7, 750, 735, 'COMPLETED', NOW() - INTERVAL '4 days', 'Stock count verified and matched with monthly billing ledger.'),

-- Store 3 (Gandhinagar Hub)
  (3, 1, 1050, 1005, 'PENDING', NOW() - INTERVAL '1 day', 'Discrepancy logged during weekly audit cycle; reviewing receipt logs.'),
  (3, 2, 1100, 1080, 'COMPLETED', NOW() - INTERVAL '2 days', 'All items accounted for; count error in prior shift corrected.'),
  (3, 3, 750, 705, 'PENDING', NOW() - INTERVAL '1 day', 'Bottles damaged during delivery unloading.'),
  (3, 4, 1600, 1575, 'COMPLETED', NOW() - INTERVAL '3 days', 'Closed investigation; weight tolerance matched.'),
  (3, 5, 650, 630, 'PENDING', NOW() - INTERVAL '1 day', 'Leaking cartons removed from active shelf.'),
  (3, 6, 2200, 2150, 'COMPLETED', NOW() - INTERVAL '4 days', 'Customer sampling deduction verified and approved.'),
  (3, 7, 900, 865, 'PENDING', NOW() - INTERVAL '1 day', 'High shrinkage investigation ongoing; CCTV review in progress for secure aisle 2.')
ON CONFLICT (store_id, product_id) DO UPDATE SET
  expected_quantity = EXCLUDED.expected_quantity,
  actual_quantity = EXCLUDED.actual_quantity,
  investigation_status = EXCLUDED.investigation_status,
  last_updated = EXCLUDED.last_updated,
  notes = EXCLUDED.notes;

-- 5. INSERT DEMAND FORECASTS (14 days past + 7 days future)
DELETE FROM demand_forecasts;
INSERT INTO demand_forecasts (store_id, product_id, forecast_date, actual_quantity, predicted_quantity, lower_bound, upper_bound)
SELECT
  s.id AS store_id,
  p.id AS product_id,
  CURRENT_DATE + (d.day_offset || ' day')::INTERVAL AS forecast_date,
  CASE WHEN d.day_offset <= 0 THEN ROUND((50 + (p.id * 8) + (s.id * 5) + (ABS(SIN(d.day_offset * 1.5)) * 25))::numeric, 0) ELSE NULL END AS actual_quantity,
  CASE WHEN d.day_offset > 0 THEN ROUND((55 + (p.id * 8) + (s.id * 5) + (ABS(COS(d.day_offset * 1.2)) * 28))::numeric, 0) ELSE NULL END AS predicted_quantity,
  ROUND((40 + (p.id * 7))::numeric, 0) AS lower_bound,
  ROUND((90 + (p.id * 10))::numeric, 0) AS upper_bound
FROM stores s
CROSS JOIN products p
CROSS JOIN (
  SELECT generate_series(-13, 7) AS day_offset
) d;

-- 6. INSERT RECONCILIATIONS / AUDITS
INSERT INTO stock_reconciliations (
  store_id, product_id,
  manager_count, manager_timestamp, manager_confidence,
  staff_count, staff_timestamp, staff_confidence,
  movement_quantity, movement_type, movement_timestamp,
  status, final_count, reviewer, reviewed_at, reason
)
VALUES
  (1, 1, 1145, NOW() - INTERVAL '1 day', 95.0, 1140, NOW() - INTERVAL '1 day 2 hours', 88.0, 5, 'Damaged', NOW() - INTERVAL '1 day', 'PENDING', NULL, NULL, NULL, 'Pallet rack A-04 physical count discrepancy'),
  (1, 3, 840, NOW() - INTERVAL '1 day', 92.0, 835, NOW() - INTERVAL '1 day 3 hours', 85.0, 5, 'Spillage', NOW() - INTERVAL '1 day', 'PENDING', NULL, NULL, NULL, 'Bay C-02 oil leak spill reported by staff'),
  (2, 1, 810, NOW() - INTERVAL '2 days', 94.0, 805, NOW() - INTERVAL '2 days', 90.0, 5, 'Transfer', NOW() - INTERVAL '2 days', 'PENDING', NULL, NULL, NULL, 'Transit variance from central batch VLR-771')
ON CONFLICT DO NOTHING;

-- 7. INSERT SEED ADJUSTMENT REQUESTS (Pending Manager Review)
INSERT INTO adjustment_requests (
  id, staff_id, staff_username, store_id, product_id,
  system_quantity, physical_quantity, difference, reason, notes,
  status, created_at
)
VALUES
  (1, 2, 'staff.vellore', 1, 1, 1145, 1138, -7, '7 units missing from secondary pallet rack A-04', 'Discrepancy identified during morning cycle count.', 'PENDING_MANAGER_REVIEW', NOW() - INTERVAL '3 hours'),
  (2, 2, 'staff.vellore', 1, 3, 840, 835, -5, 'Bottles leaked and discarded per safety norms', 'Spillage noted on shelf C-02.', 'PENDING_MANAGER_REVIEW', NOW() - INTERVAL '1 hour'),
  (3, 3, 'staff.katpadi', 2, 6, 1750, 1740, -10, 'Crushed packaging carton rejected during stock verification', 'Forklift handling damage.', 'PENDING_MANAGER_REVIEW', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO UPDATE SET
  system_quantity = EXCLUDED.system_quantity,
  physical_quantity = EXCLUDED.physical_quantity,
  difference = EXCLUDED.difference,
  reason = EXCLUDED.reason,
  status = EXCLUDED.status;

SELECT setval('adjustment_requests_id_seq', (SELECT MAX(id) FROM adjustment_requests));

-- 8. INSERT SEED AUDIT LOGS
INSERT INTO audit_logs (
  user_id, username, user_role, action, entity_type, entity_id, old_value, new_value, metadata, created_at
)
VALUES
  (1, 'manager', 'MANAGER', 'SYSTEM_INITIALIZED', 'SYSTEM', '1', NULL, '{"status": "READY"}'::jsonb, '{"note": "Stockify Multi-Store Environment Initialized"}'::jsonb, NOW() - INTERVAL '3 days'),
  (1, 'manager', 'MANAGER', 'PRICE_UPDATED', 'PRODUCT', '1', '{"price": 430.00}'::jsonb, '{"price": 450.00}'::jsonb, '{"productName": "Premium Basmati Rice (5kg)"}'::jsonb, NOW() - INTERVAL '2 days'),
  (2, 'staff.vellore', 'STAFF', 'PHYSICAL_COUNT_SUBMITTED', 'ADJUSTMENT', '1', '{"systemQuantity": 1145}'::jsonb, '{"physicalQuantity": 1138, "difference": -7}'::jsonb, '{"reason": "7 units missing from secondary pallet rack A-04"}'::jsonb, NOW() - INTERVAL '3 hours'),
  (2, 'staff.vellore', 'STAFF', 'PHYSICAL_COUNT_SUBMITTED', 'ADJUSTMENT', '2', '{"systemQuantity": 840}'::jsonb, '{"physicalQuantity": 835, "difference": -5}'::jsonb, '{"reason": "Bottles leaked and discarded per safety norms"}'::jsonb, NOW() - INTERVAL '1 hour');