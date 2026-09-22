import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Store,
  Package,
  ClipboardCheck,
  Clock,
  LogOut,
  Send,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  Layers,
  History,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatNumber, formatPercent, formatDateTime } from '../utils/formatters';

export const StaffPortalPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [storeData, setStoreData] = useState(null);
  const [storeInventory, setStoreInventory] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Form State for Stock Audit Submission
  const [selectedProductId, setSelectedProductId] = useState('');
  const [actualQuantity, setActualQuantity] = useState('');
  const [damagedQuantity, setDamagedQuantity] = useState('0');
  const [shrinkageReason, setShrinkageReason] = useState('Damaged Stock');
  const [movementType, setMovementType] = useState('None');
  const [movementQuantity, setMovementQuantity] = useState('0');
  const [notes, setNotes] = useState('');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch staff store info, store inventory, and past submissions
  const loadStaffData = async () => {
    try {
      setIsLoading(true);
      const [storeRes, historyRes] = await Promise.all([
        inventoryService.getStaffStore(),
        inventoryService.getStaffHistory().catch(() => []),
      ]);

      if (storeRes && storeRes.store) {
        setStoreData(storeRes.store);
        setStoreInventory(storeRes.inventory || []);
        if (storeRes.inventory && storeRes.inventory.length > 0 && !selectedProductId) {
          setSelectedProductId(storeRes.inventory[0].productId);
          setActualQuantity(String(storeRes.inventory[0].actualQuantity));
        }
      }

      setHistoryList(historyRes || []);
    } catch (err) {
      console.error('Error loading staff store data:', err);
      setFormError(err.message || 'Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  // When selected product changes, pre-fill actual count
  const activeProduct = storeInventory.find((p) => p.productId === Number(selectedProductId)) || storeInventory[0];

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const prod = storeInventory.find((p) => p.productId === Number(prodId));
    if (prod) {
      setActualQuantity(String(prod.actualQuantity));
    }
    setFormSuccess('');
    setFormError('');
  };

  // Calculations for preview
  const expectedCount = activeProduct ? Number(activeProduct.expectedQuantity || 0) : 0;
  const enteredActual = Number(actualQuantity || 0);
  const calculatedMissing = Math.max(0, expectedCount - enteredActual);
  const unitPrice = activeProduct ? Number(activeProduct.price || 0) : 0;
  const calculatedImpact = calculatedMissing * unitPrice;

  // Handle Form Submission
  const handleSubmitAudit = async (e) => {
    e.preventDefault();
    if (!selectedProductId || actualQuantity === '') {
      setFormError('Please select a product and enter the physical counted quantity.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        productId: Number(selectedProductId),
        actualQuantity: Number(actualQuantity),
        damagedQuantity: Number(damagedQuantity || 0),
        shrinkageReason,
        notes,
        movementType: movementType !== 'None' ? movementType : null,
        movementQuantity: Number(movementQuantity || 0),
      };

      const res = await inventoryService.submitStaffAudit(payload);

      setFormSuccess(
        `✓ Stock audit successfully submitted for ${activeProduct?.productName || 'product'}! Record synchronized with Manager Dashboard.`
      );
      setNotes('');

      // Reload inventory to reflect changes
      await loadStaffData();
    } catch (err) {
      setFormError(err.message || 'Failed to submit physical stock audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white bg-warehouse-grid">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-navy-900/90 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Role */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-white">STOCKIFY</span>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400">
                  STAFF PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Store-Specific Operational & Stock Intake Desk</p>
            </div>
          </div>

          {/* User info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-navy-850 px-3.5 py-1.5 text-xs text-slate-300">
              <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="font-mono">{formatDateTime(currentTime)}</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-navy-850 px-3 py-1.5 text-xs">
              <div className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-bold text-white leading-tight">{currentUser?.username || 'Staff User'}</p>
                <p className="text-[10px] text-cyan-400 font-mono">{currentUser?.roleId || 'STAFF'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex-1 w-full space-y-6">
        {/* Assigned Store Banner */}
        <div className="rounded-2xl border border-cyan-500/30 bg-navy-850 p-5 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Assigned Branch Node: {storeData?.code || 'Loading...'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">{storeData?.name || 'Facility Name'}</h1>
                <p className="text-xs text-slate-400 mt-0.5">{storeData?.address || storeData?.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Racks</span>
                <span className="text-base font-black text-cyan-400">{storeData?.activeRacks || 24}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Catalog SKUs</span>
                <span className="text-base font-black text-emerald-400">{storeInventory.length} Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Data Input Grid (Requirements 22 & 23) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Physical Stock Audit Submission Form */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-cyan-400" />
                  Physical Stock Count & Discrepancy Intake
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter physical cycle count, log damages/shrinkage, and record inventory movements.
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Live DB Sync
              </span>
            </div>

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAudit} className="space-y-3.5">
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  Select Grocery Item to Audit *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  {storeInventory.map((item) => (
                    <option key={item.productId} value={item.productId} className="bg-navy-900 text-white">
                      {item.productName} ({item.sku}) — Book: {formatNumber(item.expectedQuantity)} units
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantities Grid: Expected, Actual Count, Damaged */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Expected Book Stock (Read-only) */}
                <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">Expected Stock</span>
                  <p className="text-lg font-black text-white mt-1">{formatNumber(expectedCount)}</p>
                  <span className="text-[10px] text-slate-500">From system ledger</span>
                </div>

                {/* Actual Physical Counted Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Actual Count *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(e.target.value)}
                    placeholder="Counted units"
                    className="w-full rounded-xl border border-emerald-500/50 bg-slate-900 px-3.5 py-2 text-sm font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Physically verified</span>
                </div>

                {/* Damaged Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">
                    Damaged / Expired
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={damagedQuantity}
                    onChange={(e) => setDamagedQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Unsellable units</span>
                </div>
              </div>

              {/* Calculated Discrepancy Preview Banner */}
              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Calculated Variance (Missing):</span>
                  <div className="text-base font-black text-rose-400 mt-0.5">
                    {formatNumber(calculatedMissing)} units ({formatPercent(expectedCount > 0 ? (calculatedMissing / expectedCount) * 100 : 0)})
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400">Financial Impact:</span>
                  <div className="text-base font-black text-rose-400 mt-0.5">
                    {formatCurrency(calculatedImpact)}
                  </div>
                </div>
              </div>

              {/* Discrepancy Reason Selector (Requirement 26) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Discrepancy / Shrinkage Reason *
                  </label>
                  <select
                    value={shrinkageReason}
                    onChange={(e) => setShrinkageReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Damaged Stock">Damaged Stock</option>
                    <option value="Cold Chain / Expiry Discard">Cold Chain / Expiry Discard</option>
                    <option value="Spillage / Packaging Leak">Spillage / Packaging Leak</option>
                    <option value="Carton / Handling Damage">Carton / Handling Damage</option>
                    <option value="Counting Error in Prior Shift">Counting Error in Prior Shift</option>
                    <option value="Inter-Store Transfer Issue">Inter-Store Transfer Issue</option>
                    <option value="Supplier Shortage on Unloading">Supplier Shortage on Unloading</option>
                    <option value="Possible Theft / Shoplifting">Possible Theft / Shoplifting</option>
                    <option value="Customer Sampling / Deduction">Customer Sampling / Deduction</option>
                    <option value="Routine Audit - Zero Variance">Routine Audit - Zero Variance</option>
                  </select>
                </div>

                {/* Stock Movement Tracker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                    Stock Movement (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={movementType}
                      onChange={(e) => setMovementType(e.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                    >
                      <option value="None">None</option>
                      <option value="Stock Received">Stock Received</option>
                      <option value="Sales Return">Sales Return</option>
                      <option value="Transfer In">Transfer In</option>
                      <option value="Transfer Out">Transfer Out</option>
                    </select>

                    <input
                      type="number"
                      min={0}
                      value={movementQuantity}
                      onChange={(e) => setMovementQuantity(e.target.value)}
                      placeholder="Qty"
                      className="rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Notes / Root Cause Investigation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Investigation Observations & Staff Notes:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record pallet rack location, batch number, transport bill, or CCTV aisle note..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs sm:text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting to Database...' : 'SUBMIT PHYSICAL AUDIT TO MANAGER'}</span>
              </button>
            </form>
          </div>

          {/* Right: Assigned Store Inventory Checklist */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-cyan-400" />
                    Store Inventory Status
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Verified on-shelf vs expected book stock</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{storeInventory.length} SKUs</span>
              </div>

              {/* Inventory Table */}
              <div className="overflow-y-auto max-h-96 mt-3 space-y-2">
                {storeInventory.map((item) => {
                  const isSelected = item.productId === Number(selectedProductId);
                  const isHighShrinkage = item.shrinkagePercent > 3.0;

                  return (
                    <div
                      key={item.productId}
                      onClick={() => handleProductChange(item.productId)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-glow-cyan'
                          : 'border-slate-800 bg-navy-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{item.productName}</p>
                          <p className="text-[10px] font-mono text-cyan-400">{item.sku} • {formatCurrency(item.price)}</p>
                        </div>

                        <Badge variant={isHighShrinkage ? 'danger' : 'success'}>
                          {item.investigationStatus}
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                        <span>Book: <strong className="text-white">{formatNumber(item.expectedQuantity)}</strong></span>
                        <span>Actual: <strong className="text-emerald-400">{formatNumber(item.actualQuantity)}</strong></span>
                        <span>Diff: <strong className={item.missingQuantity > 0 ? 'text-rose-400' : 'text-slate-400'}>{formatNumber(item.missingQuantity)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom info */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Store-specific Access Protocol
              </span>
              <span>All updates logged to audit table</span>
            </div>
          </div>
        </div>

        {/* Recent Audit Submissions History Log (Requirement 23 & 24) */}
        <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Recent Audit Submissions for {storeData?.name}</h3>
                <p className="text-xs text-slate-400">Activity stream submitted to Manager Investigation Desk</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">{historyList.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 rounded-l-lg">Product</th>
                  <th className="py-3 px-2.5">Staff User</th>
                  <th className="py-3 px-2.5 text-right">Expected</th>
                  <th className="py-3 px-2.5 text-right">Actual Count</th>
                  <th className="py-3 px-2.5 text-right">Missing</th>
                  <th className="py-3 px-2.5">Shrinkage Reason</th>
                  <th className="py-3 px-2.5">Movement</th>
                  <th className="py-3 px-3.5 text-right rounded-r-lg">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {historyList.slice(0, 10).map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-white">
                      {sub.productName}
                      <span className="block font-mono text-[10px] text-cyan-400">{sub.sku}</span>
                    </td>
                    <td className="py-3 px-2.5 font-mono text-slate-300">{sub.staffUsername}</td>
                    <td className="py-3 px-2.5 text-right text-slate-300">{formatNumber(sub.expectedQuantity)}</td>
                    <td className="py-3 px-2.5 text-right text-emerald-400 font-bold">{formatNumber(sub.actualQuantity)}</td>
                    <td className="py-3 px-2.5 text-right text-rose-400 font-bold">{formatNumber(sub.missingQuantity)}</td>
                    <td className="py-3 px-2.5 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                        {sub.shrinkageReason}
                      </span>
                    </td>
                    <td className="py-3 px-2.5 text-slate-400">
                      {sub.movementType ? `${sub.movementType} (${sub.movementQuantity})` : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-400 text-[11px]">
                      {new Date(sub.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
                {historyList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No audits submitted yet for this store cycle. Use the form above to record physical stock counts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffPortalPage;
