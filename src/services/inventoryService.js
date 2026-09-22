/**
 * STOCKIFY Inventory Service Layer
 * Fully connected to PostgreSQL Backend REST API endpoints
 */

import api from './api';

export const inventoryService = {
  // --- STORES ---
  async getStores() {
    return api.get('/stores');
  },

  async addStore(storeData) {
    return api.post('/stores', storeData);
  },

  async updateStore(id, storeData) {
    return api.put(`/stores/${id}`, storeData);
  },

  async deleteStore(id) {
    return api.delete(`/stores/${id}`);
  },

  // --- PRODUCTS ---
  async getProducts() {
    return api.get('/products');
  },

  async addProduct(productData) {
    return api.post('/products', productData);
  },

  async updateProduct(id, productData) {
    return api.put(`/products/${id}`, productData);
  },

  async updateProductPrice(id, price) {
    return api.patch(`/products/${id}/price`, { price });
  },

  async deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },

  // --- INVENTORY ---
  async getInventory(params = {}) {
    const query = new URLSearchParams();
    if (params.storeId) query.append('storeId', params.storeId);
    if (params.productId) query.append('productId', params.productId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/inventory${qs}`);
  },

  async updateStockQuantity(storeId, productId, actualQuantity, reason = '') {
    return api.put(`/inventory/${storeId}/${productId}`, { actualQuantity, reason });
  },

  async updateInvestigationStatus(storeId, productId, status, notes = '') {
    return api.put(`/inventory/${storeId}/${productId}/investigation`, { status, notes });
  },

  // --- PHYSICAL COUNT & STOCK ADJUSTMENT REQUESTS ---
  async submitPhysicalCount(countData) {
    return api.post('/inventory/physical-count', countData);
  },

  async getAdjustments(params = {}) {
    const query = new URLSearchParams();
    if (params.storeId) query.append('storeId', params.storeId);
    if (params.productId) query.append('productId', params.productId);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/adjustments${qs}`);
  },

  async approveAdjustment(id, managerComment = '') {
    return api.post(`/adjustments/${id}/approve`, { managerComment });
  },

  async rejectAdjustment(id, managerComment = '') {
    return api.post(`/adjustments/${id}/reject`, { managerComment });
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.action) query.append('action', params.action);
    if (params.entityType) query.append('entityType', params.entityType);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/audit-logs${qs}`);
  },

  // --- STAFF MANAGEMENT ---
  async getStaffList() {
    return api.get('/auth/staff');
  },

  async createStaff(staffData) {
    return api.post('/auth/staff', staffData);
  },

  async assignStaffStore(id, storeId) {
    return api.put(`/auth/staff/${id}/assign`, { storeId });
  },

  async deleteStaff(id) {
    return api.delete(`/auth/staff/${id}`);
  },

  // --- DASHBOARD METRICS ---
  async getDashboardMetrics() {
    const res = await api.get('/dashboard/metrics');
    return res.metrics;
  },

  // --- TIME SERIES / FORECASTS ---
  async getTimeSeries(storeId, productId) {
    const query = new URLSearchParams();
    if (storeId) query.append('storeId', storeId);
    if (productId) query.append('productId', productId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/forecasts${qs}`);
  },

  // --- RECONCILIATIONS ---
  async getReconciliations(params = {}) {
    const query = new URLSearchParams();
    if (params.storeId) query.append('storeId', params.storeId);
    if (params.productId) query.append('productId', params.productId);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/reconciliations${qs}`);
  },

  async resolveReconciliation(id, resolutionData) {
    return api.put(`/reconciliations/${id}/resolve`, resolutionData);
  },

  // --- STAFF PORTAL ---
  async getStaffStore() {
    return api.get('/staff/my-store');
  },

  async submitStaffAudit(auditData) {
    return api.post('/staff/submit-audit', auditData);
  },

  async getStaffHistory() {
    return api.get('/staff/history');
  },
};

export default inventoryService;
