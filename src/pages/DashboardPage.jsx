import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Package,
  IndianRupee,
  PieChart as PieIcon,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  History,
  ClipboardCheck,
  CheckCircle2,
  Send,
  Plus,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CustomChartTooltip } from '../components/common/CustomChartTooltip';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const {
    stores,
    inventory,
    globalMetrics,
    shrinkagePieData,
    storeShrinkageData,
    highShrinkageProducts,
    adjustments,
    pendingAdjustmentsCount,
    submitPhysicalCount,
    lastDataUpdate,
  } = useInventory();

  const navigate = useNavigate();
  const isManager = currentUser?.role === 'MANAGER';
  const isStaff = currentUser?.role === 'STAFF';

  // State for Staff Quick Physical Count Intake Modal
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actualQuantity, setActualQuantity] = useState('');
  const [shrinkageReason, setShrinkageReason] = useState('Damaged Stock');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Assigned store inventory for staff
  const staffStoreId = currentUser?.storeId;
  const staffStore = stores.find((s) => s.id === staffStoreId) || stores[0] || null;
  const staffInventory = staffStoreId
    ? inventory.filter((item) => item.storeId === staffStoreId)
    : inventory;

  // Staff Store summary metrics
  const staffExpectedStock = staffInventory.reduce((sum, item) => sum + (item.expectedQuantity || 0), 0);
  const staffActualStock = staffInventory.reduce((sum, item) => sum + (item.actualQuantity || 0), 0);
  const staffMissingStock = staffInventory.reduce((sum, item) => sum + (item.missingQuantity || 0), 0);
  const staffFinancialLoss = staffInventory.reduce((sum, item) => sum + (item.financialImpact || 0), 0);
  const staffShrinkagePercent =
    staffExpectedStock > 0 ? Number(((staffMissingStock / staffExpectedStock) * 100).toFixed(2)) : 0;

  // Staff recent submissions (adjustments)
  const staffSubmissions = adjustments.filter(
    (a) => !staffStoreId || a.storeId === staffStoreId || a.staffId === currentUser?.id
  );

  const handleOpenCountModal = (item) => {
    setSelectedItem(item);
    setActualQuantity(item ? String(item.actualQuantity || 0) : '');
    setShrinkageReason('Damaged Stock');
    setNotes('');
    setSubmitSuccess('');
    setSubmitError('');
    setIsCountModalOpen(true);
  };

  const handleSubmitCount = async (e) => {
    e.preventDefault();
    if (!selectedItem || actualQuantity === '') {
      setSubmitError('Please enter the physically verified count.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await submitPhysicalCount({
        productId: selectedItem.productId,
        storeId: selectedItem.storeId || staffStoreId,
        actualQuantity: Number(actualQuantity),
        reason: shrinkageReason,
        notes: notes || 'Submitted via Dashboard Quick Intake',
      });

      setSubmitSuccess(
        `Physical count for ${selectedItem.productName} submitted successfully! Awaiting manager review.`
      );
      setTimeout(() => {
        setIsCountModalOpen(false);
      }, 1400);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit physical count');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Staff Operational Dashboard if logged in as Staff
  if (isStaff) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Store Operations Dashboard
              </h1>
              <Badge variant="info">
                {staffStore ? staffStore.name : 'Assigned Store Node'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Store-level operational telemetry, physical cycle count logging, and discrepancy tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/staff')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-850 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4 text-cyan-400" />
              <span>Full Audit Intake</span>
            </button>
            <button
              onClick={() => handleOpenCountModal(staffInventory[0] || null)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-glow-cyan hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Physical Count</span>
            </button>
          </div>
        </div>

        {/* Assigned Store Banner */}
        <div className="rounded-2xl border border-cyan-500/30 bg-navy-850 p-4 sm:p-5 shadow-card relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Assigned Facility Node: {staffStore?.code || 'STORE-NODE'}
                </span>
                <h2 className="text-xl font-black text-white">{staffStore?.name || 'Local Store Hub'}</h2>
                <p className="text-xs text-slate-400">{staffStore?.location || staffStore?.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="primary">Operational Status: Active</Badge>
              <span className="text-xs text-slate-400 font-mono">
                Store ID: {staffStoreId || staffStore?.id}
              </span>
            </div>
          </div>
        </div>

        {/* Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Store Catalog Items"
            value={staffInventory.length}
            subtitle="Tracked SKUs in this store"
            icon={Package}
            highlightColor="cyan"
          />
          <StatCard
            title="Actual Verified Units"
            value={formatNumber(staffActualStock)}
            subtitle={`Expected book units: ${formatNumber(staffExpectedStock)}`}
            icon={ShieldCheck}
            highlightColor="emerald"
          />
          <StatCard
            title="Pending Submissions"
            value={staffSubmissions.filter((s) => s.status === 'PENDING_MANAGER_REVIEW').length}
            subtitle="Cycle counts awaiting manager approval"
            icon={ClipboardCheck}
            highlightColor="blue"
          />
          <StatCard
            title="Store Shrinkage Rate"
            value={formatPercent(staffShrinkagePercent)}
            subtitle={`Loss value: ${formatCurrency(staffFinancialLoss)}`}
            icon={PieIcon}
            trend={staffShrinkagePercent > 3.0 ? 'Exceeds target threshold' : 'Within normal limits'}
            trendPositive={staffShrinkagePercent <= 3.0}
            highlightColor={staffShrinkagePercent > 3.0 ? 'rose' : 'emerald'}
          />
        </div>

        {/* Main Operational Grid: Store Stock List & Recent Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Store Inventory Stock Table */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Store Shelf Stock & Physical Audit
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click 'Count' on any SKU to submit verified shelf count to the manager.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">{staffInventory.length} SKUs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg">Product</th>
                    <th className="py-3 px-2 text-right">Book Qty</th>
                    <th className="py-3 px-2 text-right">Verified</th>
                    <th className="py-3 px-2 text-right">Discrepancy</th>
                    <th className="py-3 px-3 text-center rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {staffInventory.slice(0, 8).map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {item.productName}
                        <span className="block text-[10px] font-mono text-cyan-400">{item.sku}</span>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-300 font-mono">
                        {formatNumber(item.expectedQuantity)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-400 font-mono">
                        {formatNumber(item.actualQuantity)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold">
                        <span className={item.missingQuantity > 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {item.missingQuantity > 0 ? `-${formatNumber(item.missingQuantity)}` : '0'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenCountModal(item)}
                          className="px-2.5 py-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-bold transition-all"
                        >
                          Count
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Submissions Status Tracking */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-cyan-400" />
                  Your Audit Submissions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time status of physical counts submitted to Manager.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">{staffSubmissions.length} Total</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {staffSubmissions.slice(0, 6).map((sub) => {
                const isPending = sub.status === 'PENDING_MANAGER_REVIEW';
                const isApproved = sub.status === 'APPROVED';
                const isRejected = sub.status === 'REJECTED';

                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl border border-slate-800 bg-navy-900/70 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-white">{sub.productName || 'Product'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                        </p>
                      </div>
                      <Badge
                        variant={isApproved ? 'success' : isRejected ? 'danger' : 'warning'}
                      >
                        {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING REVIEW'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-navy-950/60 p-2 rounded-lg text-slate-300">
                      <span>System: <strong className="text-white">{formatNumber(sub.systemQuantity)}</strong></span>
                      <span>Physical: <strong className="text-emerald-400">{formatNumber(sub.physicalQuantity)}</strong></span>
                      <span>Diff: <strong className={sub.difference < 0 ? 'text-rose-400' : 'text-slate-300'}>{sub.difference}</strong></span>
                    </div>

                    {sub.managerComment && (
                      <div className="text-[11px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded border border-slate-800">
                        Manager Note: "{sub.managerComment}"
                      </div>
                    )}
                  </div>
                );
              })}

              {staffSubmissions.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No submissions recorded yet. Use 'Submit Physical Count' to log verified shelf numbers.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Physical Count Modal */}
        <Modal
          isOpen={isCountModalOpen}
          onClose={() => setIsCountModalOpen(false)}
          title="Submit Physical Stock Count"
          maxWidth="max-w-md"
        >
          {submitSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitCount} className="space-y-4 text-xs">
            {/* Product Selector if not locked */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Product *</label>
              <select
                value={selectedItem?.productId || ''}
                onChange={(e) => {
                  const item = staffInventory.find((p) => p.productId === Number(e.target.value));
                  setSelectedItem(item || null);
                  setActualQuantity(item ? String(item.actualQuantity || 0) : '');
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
              >
                {staffInventory.map((item) => (
                  <option key={item.productId} value={item.productId}>
                    {item.productName} ({item.sku}) — Book: {formatNumber(item.expectedQuantity)}
                  </option>
                ))}
              </select>
            </div>

            {/* Book vs Actual Counts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">System Book Qty</span>
                <p className="text-lg font-black text-white mt-0.5">
                  {formatNumber(selectedItem?.expectedQuantity || 0)}
                </p>
                <span className="text-[10px] text-slate-500">Official Database Qty</span>
              </div>

              <div>
                <label className="block text-emerald-400 font-bold mb-1">Physically Counted *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(e.target.value)}
                  placeholder="Counted units"
                  className="w-full rounded-xl border border-emerald-500/50 bg-slate-900 px-3 py-2.5 text-sm font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Verified on shelves</span>
              </div>
            </div>

            {/* Discrepancy Reason */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Discrepancy / Audit Reason</label>
              <select
                value={shrinkageReason}
                onChange={(e) => setShrinkageReason(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="Damaged Stock">Damaged Stock</option>
                <option value="Cold Chain / Expiry Discard">Cold Chain / Expiry Discard</option>
                <option value="Spillage / Packaging Leak">Spillage / Packaging Leak</option>
                <option value="Carton / Handling Damage">Carton / Handling Damage</option>
                <option value="Counting Error in Prior Shift">Counting Error in Prior Shift</option>
                <option value="Inter-Store Transfer Issue">Inter-Store Transfer Issue</option>
                <option value="Possible Theft / Shoplifting">Possible Theft / Shoplifting</option>
                <option value="Routine Audit - Zero Variance">Routine Audit - Zero Variance</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Observations & Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Aisle location, batch tag, reason details..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white text-xs placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-navy-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Submission creates a pending adjustment request. Official inventory will be updated once reviewed and approved by Manager.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCountModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit to Manager'}</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Enterprise Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-store stock valuation, master catalog control, shrinkage analytics, and centralized adjustment approvals.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/demand-forecast')}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-850 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Demand Forecast</span>
          </button>

          <button
            onClick={() => navigate('/audit-log')}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-850 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Audit Ledger</span>
          </button>

          <button
            onClick={() => navigate('/investigation')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Investigation ({highShrinkageProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Pending Adjustments Review Banner for Manager */}
      {pendingAdjustmentsCount > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-amber-300">
                  Stock Adjustment Approvals Required
                </h3>
                <Badge variant="warning">{pendingAdjustmentsCount} Pending</Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Staff submitted verified physical counts with variances requiring your review and authorization before inventory is committed.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/investigation')}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-navy-950 hover:bg-amber-400 transition-all shrink-0 shadow-sm"
          >
            <span>Review Submissions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stores */}
        <StatCard
          title="Total Stores"
          value={globalMetrics.totalStores}
          subtitle="Active retail hubs in Vellore region"
          icon={Store}
          highlightColor="cyan"
        />

        {/* Total Products */}
        <StatCard
          title="Total Products"
          value={globalMetrics.totalProducts || 0}
          subtitle={`${globalMetrics.totalSKUsAcrossStores || ((globalMetrics.totalProducts || 0) * (globalMetrics.totalStores || 0))} store SKU stock records`}
          icon={Package}
          highlightColor="blue"
        />

        {/* Total Inventory Value */}
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(globalMetrics.totalInventoryValue)}
          subtitle="Sum of actual verified on-hand stock"
          icon={IndianRupee}
          trend="+2.4% vs last week"
          trendPositive={true}
          highlightColor="emerald"
        />

        {/* Dynamic Shrinkage Percentage Card */}
        <StatCard
          title="Average Shrinkage"
          value={formatPercent(globalMetrics.averageShrinkagePercent)}
          subtitle={`Financial loss: ${formatCurrency(globalMetrics.totalFinancialImpact)}`}
          icon={PieIcon}
          trend={globalMetrics.averageShrinkagePercent > 3.0 ? 'Exceeds 3.0% threshold' : 'Optimal'}
          trendPositive={globalMetrics.averageShrinkagePercent <= 3.0}
          highlightColor={globalMetrics.averageShrinkagePercent > 3.0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Main Charts & Stores Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Shrinkage Pie Chart Card */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-cyan-400" />
                Dynamic Stock & Shrinkage Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized ratio of Normal Stock vs Shrinkage vs In-Transit/Adjusted Buffer
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Live Computed
            </span>
          </div>

          {/* Recharts Pie Chart */}
          <div className="h-64 sm:h-72 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shrinkagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                >
                  {shrinkagePieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#0F172A"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip type="pie" />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-xs text-slate-300 font-medium">
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-xs font-semibold uppercase text-slate-400">Shrinkage</span>
              <span className="text-2xl font-black text-rose-400">
                {formatPercent(globalMetrics.averageShrinkagePercent)}
              </span>
            </div>
          </div>

          {/* Legend Details Breakdown */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center">
            {shrinkagePieData.map((slice) => (
              <div key={slice.name} className="p-2 rounded-xl bg-navy-900/70 border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block truncate">
                  {slice.name}
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {formatNumber(slice.value)}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {slice.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Store-Wise Shrinkage Performance Overview */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Store-Wise Shrinkage Comparison
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Formula: Shrinkage = Expected Stock − Actual Stock
              </p>
            </div>
            <button
              onClick={() => navigate('/shrinkage')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Store Rows */}
          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {storeShrinkageData.map((s) => {
              const isHigh = s.shrinkagePercent > 3.0;
              return (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-slate-800 bg-navy-900/60 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <h3 className="text-xs font-bold text-white">{s.name}</h3>
                      <p className="text-[10px] font-mono text-slate-400">
                        {s.code} • {s.location || s.address}
                      </p>
                    </div>
                    <Badge variant={isHigh ? 'danger' : 'success'}>
                      {s.shrinkagePercent}% Loss
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800/60">
                    <span>Expected: <strong className="text-white">{formatNumber(s.expectedStock)}</strong></span>
                    <span>Actual: <strong className="text-emerald-400">{formatNumber(s.actualStock)}</strong></span>
                    <span>Missing: <strong className="text-rose-400">{formatNumber(s.missingStock)}</strong></span>
                    <span>Impact: <strong className="text-white">{formatCurrency(s.financialImpact)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};