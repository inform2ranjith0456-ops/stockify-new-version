/**
 * STOCKIFY Centralized Mock & Sample Data Architecture
 * 
 * PostgreSQL-ready:
 * - stores (id, code, name, location, address, manager, phone)
 * - products (id, sku, name, category, unit, price, barcode)
 * - store_inventory (store_id, product_id, expected_quantity, actual_quantity, investigation_status, last_updated)
 * - daily_sales & demand_forecast
 */

export const INITIAL_STORES = [
  {
    id: 'STR-001',
    code: 'VLR-CENTRAL',
    name: 'Vellore Central Inventory Facility',
    location: 'Vellore Main, Tamil Nadu',
    address: 'Stockify Central Inventory Facility, Phase 2 Industrial Corridor, Vellore, Tamil Nadu 632014',
    manager: 'Rajesh Kumar (MGR-4401)',
    phone: '+91 98401 23456',
    activeRacks: 48,
  },
  {
    id: 'STR-002',
    code: 'VLR-KATPADI',
    name: 'Katpadi Junction Retail Depot',
    location: 'Katpadi, Vellore, Tamil Nadu',
    address: 'Depot Rd, Near Katpadi Station, Katpadi, Vellore, Tamil Nadu 632007',
    manager: 'Priya Sundaram (MGR-4402)',
    phone: '+91 98402 34567',
    activeRacks: 32,
  },
  {
    id: 'STR-003',
    code: 'VLR-GANDHI',
    name: 'Gandhinagar Supercenter Hub',
    location: 'Gandhinagar, Vellore, Tamil Nadu',
    address: 'Main Commercial Ave, 4th Cross, Gandhinagar, Vellore, Tamil Nadu 632006',
    manager: 'Ananth Narayanan (MGR-4403)',
    phone: '+91 98403 45678',
    activeRacks: 36,
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'PRD-001',
    sku: 'GRO-RICE-001',
    name: 'Premium Basmati Rice (5kg)',
    shortName: 'Rice',
    category: 'Grains & Staples',
    unit: 'Bag (5kg)',
    price: 450,
    barcode: '8901030012014',
    minSafeStock: 200,
  },
  {
    id: 'PRD-002',
    sku: 'GRO-ATTA-002',
    name: 'Whole Wheat Chakki Atta (5kg)',
    shortName: 'Wheat Flour',
    category: 'Grains & Staples',
    unit: 'Bag (5kg)',
    price: 260,
    barcode: '8901030023025',
    minSafeStock: 250,
  },
  {
    id: 'PRD-003',
    sku: 'GRO-COIL-003',
    name: 'Pure Refined Sunflower Cooking Oil (1L)',
    shortName: 'Cooking Oil',
    category: 'Edible Oils',
    unit: 'Pouch (1L)',
    price: 155,
    barcode: '8901030034036',
    minSafeStock: 180,
  },
  {
    id: 'PRD-004',
    sku: 'GRO-SUGR-004',
    name: 'Pure White Crystal Sugar (1kg)',
    shortName: 'Sugar',
    category: 'Essentials',
    unit: 'Pack (1kg)',
    price: 48,
    barcode: '8901030045047',
    minSafeStock: 300,
  },
  {
    id: 'PRD-005',
    sku: 'GRO-MILK-005',
    name: 'Farm Fresh Whole Milk (1L)',
    shortName: 'Milk',
    category: 'Dairy & Perishables',
    unit: 'Carton (1L)',
    price: 64,
    barcode: '8901030056058',
    minSafeStock: 150,
  },
  {
    id: 'PRD-006',
    sku: 'GRO-BISC-006',
    name: 'Butter Crunch Biscuits (300g)',
    shortName: 'Biscuits',
    category: 'Bakery & Snacks',
    unit: 'Pack (300g)',
    price: 35,
    barcode: '8901030067069',
    minSafeStock: 400,
  },
  {
    id: 'PRD-007',
    sku: 'GRO-TEA-007',
    name: 'Premium Assam CTC Black Tea (500g)',
    shortName: 'Tea',
    category: 'Beverages',
    unit: 'Box (500g)',
    price: 210,
    barcode: '8901030078070',
    minSafeStock: 150,
  },
];

export const INITIAL_STORE_INVENTORY = [
  // STORE 1: Vellore Central Hub
  {
    storeId: 'STR-001',
    productId: 'PRD-001',
    expectedQuantity: 1200,
    actualQuantity: 1145,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 18:30:00',
    notes: 'Audit variance detected on Pallet Rack A-04 during physical cycle count.',
  },
  {
    storeId: 'STR-001',
    productId: 'PRD-002',
    expectedQuantity: 1500,
    actualQuantity: 1470,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-11 14:15:00',
    notes: 'Bulk packing tear reconciled with supplier credit note.',
  },
  {
    storeId: 'STR-001',
    productId: 'PRD-003',
    expectedQuantity: 900,
    actualQuantity: 840,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 19:45:00',
    notes: 'High shrinkage detected; spillage near bay C-02 undergoing review.',
  },
  {
    storeId: 'STR-001',
    productId: 'PRD-004',
    expectedQuantity: 2200,
    actualQuantity: 2170,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-10 11:20:00',
    notes: 'Moisture humidity weight loss variance calibrated and closed.',
  },
  {
    storeId: 'STR-001',
    productId: 'PRD-005',
    expectedQuantity: 800,
    actualQuantity: 790,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-12 08:30:00',
    notes: 'Cold chain expiry discard logged per FSSAI safety norms.',
  },
  {
    storeId: 'STR-001',
    productId: 'PRD-006',
    expectedQuantity: 3000,
    actualQuantity: 2940,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 17:10:00',
    notes: 'Carton damage during forklift offloading on bay 3.',
  },
  {
    storeId: 'STR-001',
    productId: 'PRD-007',
    expectedQuantity: 1100,
    actualQuantity: 1085,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-09 16:50:00',
    notes: 'Verified against supplier dispatch invoice; zero security variance.',
  },

  // STORE 2: Katpadi Junction Retail Depot
  {
    storeId: 'STR-002',
    productId: 'PRD-001',
    expectedQuantity: 850,
    actualQuantity: 810,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 20:10:00',
    notes: 'Inter-store transfer transit variance from central facility dispatch batch VLR-771.',
  },
  {
    storeId: 'STR-002',
    productId: 'PRD-002',
    expectedQuantity: 950,
    actualQuantity: 930,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-11 12:40:00',
    notes: 'Dispatch receipt discrepancy verified and corrected.',
  },
  {
    storeId: 'STR-002',
    productId: 'PRD-003',
    expectedQuantity: 620,
    actualQuantity: 585,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 19:15:00',
    notes: 'Potential cashier barcode scan omission during peak weekend rush.',
  },
  {
    storeId: 'STR-002',
    productId: 'PRD-004',
    expectedQuantity: 1400,
    actualQuantity: 1365,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-10 15:30:00',
    notes: 'Repackaging loss logged and approved by manager.',
  },
  {
    storeId: 'STR-002',
    productId: 'PRD-005',
    expectedQuantity: 500,
    actualQuantity: 480,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 10:00:00',
    notes: 'Chiller door gasket leak caused minor batch write-off.',
  },
  {
    storeId: 'STR-002',
    productId: 'PRD-006',
    expectedQuantity: 1800,
    actualQuantity: 1720,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 16:30:00',
    notes: 'High front-end shelf shrinkage in aisle 4; investigating customer blind spot.',
  },
  {
    storeId: 'STR-002',
    productId: 'PRD-007',
    expectedQuantity: 750,
    actualQuantity: 740,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-08 17:15:00',
    notes: 'Stock verified with RF hand terminal; audit closed.',
  },

  // STORE 3: Gandhinagar Supercenter Hub
  {
    storeId: 'STR-003',
    productId: 'PRD-001',
    expectedQuantity: 950,
    actualQuantity: 915,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-11 18:20:00',
    notes: 'Warehouse transfer slip reconciliations finalized.',
  },
  {
    storeId: 'STR-003',
    productId: 'PRD-002',
    expectedQuantity: 1100,
    actualQuantity: 1080,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-10 14:10:00',
    notes: 'Regular shelf audit completed with satisfactory tolerance.',
  },
  {
    storeId: 'STR-003',
    productId: 'PRD-003',
    expectedQuantity: 780,
    actualQuantity: 740,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 21:00:00',
    notes: 'Audit flagged unrecorded stock movement to promotional front-end display.',
  },
  {
    storeId: 'STR-003',
    productId: 'PRD-004',
    expectedQuantity: 1650,
    actualQuantity: 1605,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 11:30:00',
    notes: 'Bag puncture during conveyor transfer; write-off pending manager sign-off.',
  },
  {
    storeId: 'STR-003',
    productId: 'PRD-005',
    expectedQuantity: 600,
    actualQuantity: 575,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 09:15:00',
    notes: 'Batch past shelf expiry; clearance pending reverse logistics pickup.',
  },
  {
    storeId: 'STR-003',
    productId: 'PRD-006',
    expectedQuantity: 2200,
    actualQuantity: 2150,
    investigationStatus: 'COMPLETED',
    lastUpdated: '2026-09-09 15:45:00',
    notes: 'Customer sampling deduction verified and approved.',
  },
  {
    storeId: 'STR-003',
    productId: 'PRD-007',
    expectedQuantity: 900,
    actualQuantity: 865,
    investigationStatus: 'PENDING',
    lastUpdated: '2026-09-12 18:00:00',
    notes: 'High shrinkage investigation ongoing; CCTV review in progress for secure aisle 2.',
  },
];

export const generateProductTimeSeries = (storeId, productId) => {
  const store = INITIAL_STORES.find((s) => s.id === storeId) || INITIAL_STORES[0];
  const product = INITIAL_PRODUCTS.find((p) => p.id === productId) || INITIAL_PRODUCTS[0];

  const seed = (store.code.charCodeAt(4) + product.name.charCodeAt(0)) % 10;
  const baseDemand = Math.floor(product.price > 200 ? 55 : 175) + seed * 8;

  const dates = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 14 days historical
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const dayOfWeek = days[d.getDay()];
    const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
    const variance = Math.sin(i * 1.3) * 14 + (isWeekend ? 32 : 0) + (seed * 3);
    const actualSales = Math.max(12, Math.round(baseDemand + variance));
    const demandValue = Math.round(actualSales * 1.06);

    dates.push({
      date: dateStr,
      fullDate: d.toISOString().split('T')[0],
      day: dayOfWeek,
      sales: actualSales,
      revenue: actualSales * product.price,
      historicalDemand: demandValue,
      predictedDemand: null,
      isForecast: false,
      productName: product.name,
      unitPrice: product.price,
    });
  }

  // 7 days predicted forecast
  for (let j = 1; j <= 7; j++) {
    const d = new Date();
    d.setDate(d.getDate() + j);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const dayOfWeek = days[d.getDay()];
    const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
    const forecastVariance = Math.cos(j * 0.8) * 16 + (isWeekend ? 36 : 4) + (seed * 4);
    const forecastVal = Math.max(18, Math.round(baseDemand * 1.07 + forecastVariance));

    dates.push({
      date: dateStr,
      fullDate: d.toISOString().split('T')[0],
      day: dayOfWeek,
      sales: null,
      revenue: null,
      historicalDemand: null,
      predictedDemand: forecastVal,
      isForecast: true,
      productName: product.name,
      unitPrice: product.price,
    });
  }

  return dates;
};
