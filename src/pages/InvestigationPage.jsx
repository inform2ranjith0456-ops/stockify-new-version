import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Store,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Sliders,
  History,
  Info,
  ClipboardCheck,
  Check,
  X,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { inventoryService } from '../services/inventoryService';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatNumber, formatPercent, formatDateTime } from '../utils/formatters';

export const InvestigationPage = () => {
  const { currentUser } = useAuth();
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    selectedStore,
    selectedProductId,
    setSelectedProductId,
    storeProducts,
    activeProductInventory,
    updateInvestigationStatus,
    updateStock,
    adjustments,
    pendingAdjustments,
    pendingAdjustmentsCount,
    approveAdjustment,
    rejectAdjustment,
    lastDataUpdate,
  } = useInventory();

  const isManager = currentUser?.role === 'MANAGER';
  const isStaff = currentUser?.role === 'STAFF';

  // Dynamic live clock
  const [currentTime, setCurrentTime] = useState(new Date());
  const [auditNotes, setAuditNotes] = useState('');
  const [stockEditValue, setStockEditValue] = useState('');
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reconciliations, setReconciliations] = useState([]);
  const [isResolving, setIsResolving] = useState(false);

  // Manager Review Modal for pending adjustment requests
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [managerComment, setManagerComment] = useState('');
  const [isProcessingAdjustment, setIsProcessingAdjustment] = useState(false);
  const [adjustmentActionSuccess, setAdjustmentActionSuccess] = useState('');
  const [adjustmentActionError, setAdjustmentActionError] = useState('');

  // Lock staff to their assigned store
  useEffect(() => {
    if (isStaff && currentUser?.storeId && selectedStoreId !== currentUser.storeId) {
      setSelectedStoreId(currentUser.storeId);
    }
  }, [isStaff, currentUser?.storeId, selectedStoreId, setSelectedStoreId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeProductInventory) {
      setAuditNotes(activeProductInventory.notes || '');
      setStockEditValue(String(activeProductInventory.actualQuantity || 0));
      setIsEditingStock(false);
    }
  }, [activeProductInventory?.productId, activeProductInventory?.storeId]);

  // Load pending reconciliations from database
  useEffect(() => {
    inventoryService
      .getReconciliations({ storeId: selectedStoreId })
      .then((data) => {
        setReconciliations(data || []);
      })
      .catch(() => {});
  }, [selectedStoreId, lastDataUpdate]);

  // Toggle status between PENDING and COMPLETED
  const handleToggleStatus = async () => {
    if (!activeProductInventory || !selectedStoreId) return;
    const newStatus =
      activeProductInventory.investigationStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    await updateInvestigationStatus(
      selectedStoreId,
      activeProductInventory.productId,
      newStatus,
      auditNotes
    );
  };

  // Save stock adjustment to database
  const handleSaveStockAdjustment = async (e) => {
    e.preventDefault();
    const qty = parseInt(stockEditValue, 10);
    if (!isNaN(qty) && qty >= 0 && activeProductInventory && selectedStoreId) {
      await updateStock(selectedStoreId, activeProductInventory.productId, qty);
      setIsEditingStock(false);
    }
  };

  // Adjustment Review Handlers
  const handleOpenReviewModal = (adj) => {
    setSelectedAdjustment(adj);
    setManagerComment('');
    setAdjustmentActionSuccess('');
    setAdjustmentActionError('');
    setIsReviewModalOpen(true);
  };

  const handleApproveAdjustment = async (adjId) => {
    setIsProcessingAdjustment(true);
    setAdjustmentActionError('');
    setAdjustmentActionSuccess('');
    try {
      await approveAdjustment(adjId, managerComment || 'Verified and authorized by manager');
      setAdjustmentActionSuccess(
        'Stock adjustment approved! Physical count committed to database inventory.'
      );
      setTimeout(() => {
        setIsReviewModalOpen(false);
      }, 1200);
    } catch (err) {
      setAdjustmentActionError(err.message || 'Failed to approve adjustment');
    } finally {
      setIsProcessingAdjustment(false);
    }
  };

  const handleRejectAdjustment = async (adjId) => {
    setIsProcessingAdjustment(true);
    setAdjustmentActionError('');
    setAdjustmentActionSuccess('');
    try {
      await rejectAdjustment(adjId, managerComment || 'Rejected by manager');
      setAdjustmentActionSuccess(
        'Stock adjustment rejected. Database inventory remains unchanged.'
      );
      setTimeout(() => {
        setIsReviewModalOpen(false);
      }, 1200);
    } catch (err) {
      setAdjustmentActionError(err.message || 'Failed to reject adjustment');
    } finally {
      setIsProcessingAdjustment(false);
    }
  };

  // Resolve staff reconciliation (legacy fallback)
  const handleResolveReconciliation = async (recId, decision) => {
    setIsResolving(true);
    try {
      await inventoryService.resolveReconciliation(recId, {
        decision,
        reason: `Resolved by Manager (${decision} count accepted)`,
      });
      const data = await inventoryService.getReconciliations({ storeId: selectedStoreId });
      setReconciliations(data || []);
    } catch (err) {
      alert(err.message || 'Failed to resolve reconciliation');
    } finally {
      setIsResolving(false);
    }
  };

  // Filtered store products (safe against integer productId)
  const filteredProducts = storeProducts.filter((item) => {
    const pName = String(item.productName || '').toLowerCase();
    const pId = String(item.productId || '').toLowerCase();
    const pSku = String(item.sku || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = pName.includes(query) || pId.includes(query) || pSku.includes(query);
    const matchesStatus = statusFilter === 'ALL' || item.investigationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const visibleStores =
    isStaff && currentUser?.storeId
      ? stores.filter((s) => s.id === currentUser.storeId)
      : stores;

  const relevantAdjustments =
    isStaff && currentUser?.storeId
      ? adjustments.filter((a) => a.storeId === currentUser.storeId)
      : adjustments;

  const pendingList =
    isStaff && currentUser?.storeId
      ? pendingAdjustments.filter((a) => a.storeId === currentUser.storeId)
      : pendingAdjustments;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isManager ? 'Manager Investigation Desk' : 'Store Audit & Discrepancies'}
            </h1>
            {!isManager && (
              <Badge variant="info">
                Assigned Store Audit
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isManager
              ? 'Review pending physical count adjustments from store staff, inspect shrinkage variances.'
              : 'View physical count submissions, discrepancy status, and verified inventory for your assigned store.'}
          </p>
        </div>

        {/* Dynamic Live Timestamp */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-navy-850 px-4 py-2 text-xs text-slate-300 shadow-sm">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono">{formatDateTime(currentTime)}</span>
        </div>
      </div>

      {/* Step 1: Store Selection Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isManager
              ? `Step 1: Select Facility / Store (${stores.length} Active Hubs)`
              : `Assigned Facility (${visibleStores[0]?.name || 'Operational Store'})`}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleStores.map((s) => {
            const isSelected = s.id === selectedStoreId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStoreId(s.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-500 bg-navy-850 shadow-glow-cyan'
                    : 'border-slate-800 bg-navy-900/60 hover:border-slate-700 hover:bg-navy-850'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-400">{s.code}</span>
                  <Store className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-sm font-bold text-white line-clamp-1">{s.name}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.location || s.address}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MANAGER: Pending Stock Adjustments Review Desk */}
      {isManager && pendingList.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300">
                  Pending Physical Count Adjustments ({pendingList.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Store staff submitted verified shelf counts. Review variances and approve to commit changes to official inventory.
                </p>
              </div>
            </div>
            <Badge variant="warning">Awaiting Authorization</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {pendingList.map((adj) => (
              <div
                key={adj.id}
                className="p-4 rounded-xl border border-slate-700 bg-navy-900/90 text-xs space-y-3 shadow-sm hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{adj.productName}</h4>
                    <span className="font-mono text-[10px] text-cyan-400">{adj.sku} • {adj.storeName || 'Store'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
                    {adj.reason || 'Cycle Audit'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-lg bg-navy-950/70 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">System Qty</span>
                    <strong className="text-white text-sm">{formatNumber(adj.systemQuantity)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block">Staff Count</span>
                    <strong className="text-emerald-400 text-sm">{formatNumber(adj.physicalQuantity)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 block">Difference</span>
                    <strong className={adj.difference < 0 ? 'text-rose-400 text-sm' : 'text-slate-300 text-sm'}>
                      {adj.difference}
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <span>Submitted by: <strong className="text-slate-300">{adj.staffUsername || 'Staff'}</strong></span>
                  {adj.notes && <p className="italic text-slate-400 mt-1 line-clamp-2">"{adj.notes}"</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenReviewModal(adj)}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Review & Authorize</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAFF: View Your Submissions */}
      {isStaff && (
        <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <ClipboardCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Your Physical Count Submissions</h3>
                <p className="text-xs text-slate-400">Status of verified counts submitted for manager authorization</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">{relevantAdjustments.length} Submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5 rounded-l-lg">Product</th>
                  <th className="py-3 px-3 text-right">System Qty</th>
                  <th className="py-3 px-3 text-right">Physical Count</th>
                  <th className="py-3 px-3 text-right">Difference</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3.5 rounded-r-lg">Manager Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {relevantAdjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-white">
                      {a.productName}
                      <span className="block text-[10px] font-mono text-cyan-400">{a.sku}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 font-mono">{formatNumber(a.systemQuantity)}</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">{formatNumber(a.physicalQuantity)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={a.difference < 0 ? 'text-rose-400' : 'text-slate-300'}>{a.difference}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{a.reason}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {a.status === 'PENDING_MANAGER_REVIEW' ? 'PENDING REVIEW' : a.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 italic text-[11px]">
                      {a.managerComment ? `"${a.managerComment}"` : 'Pending review...'}
                    </td>
                  </tr>
                ))}
                {relevantAdjustments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No physical count submissions on record. Submit counts via the Products page or Dashboard.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 2: Investigation Table & Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Table Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4">
            {/* Table Search & Status Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Store Inventory Audit: {selectedStore?.name || 'Selected Store'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any product below to inspect its detailed audit file and toggle investigation status.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 sm:w-48 rounded-xl border border-slate-700 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            {/* Complete Investigation Information Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5 rounded-l-lg">Product Name</th>
                    <th className="py-3 px-2.5">SKU</th>
                    <th className="py-3 px-2.5 text-right">Expected Qty</th>
                    <th className="py-3 px-2.5 text-right">Actual Qty</th>
                    <th className="py-3 px-2.5 text-right">Missing Qty</th>
                    <th className="py-3 px-2.5 text-right">Unit Price</th>
                    <th className="py-3 px-2.5 text-right">Financial Impact</th>
                    <th className="py-3 px-2.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right rounded-r-lg">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProducts.map((p) => {
                    const isSelected = p.productId === selectedProductId;
                    return (
                      <tr
                        key={p.productId}
                        onClick={() => setSelectedProductId(p.productId)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/10 border-l-4 border-l-cyan-500'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">
                          {p.productName}
                        </td>
                        <td className="py-3 px-2.5 font-mono text-cyan-400 whitespace-nowrap">
                          {p.sku}
                        </td>
                        <td className="py-3 px-2.5 text-right text-slate-300">
                          {formatNumber(p.expectedQuantity)}
                        </td>
                        <td className="py-3 px-2.5 text-right text-emerald-400 font-medium">
                          {formatNumber(p.actualQuantity)}
                        </td>
                        <td className="py-3 px-2.5 text-right text-rose-400 font-bold">
                          {formatNumber(p.missingQuantity)}
                        </td>
                        <td className="py-3 px-2.5 text-right text-slate-300">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-3 px-2.5 text-right font-bold text-rose-400 whitespace-nowrap">
                          {formatCurrency(p.financialImpact)}
                        </td>
                        <td className="py-3 px-2.5 text-center whitespace-nowrap">
                          <Badge variant={p.investigationStatus === 'COMPLETED' ? 'success' : 'warning'}>
                            {p.investigationStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No product audit records found matching the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Product Information Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-cyan-500/30 bg-navy-850 p-5 shadow-card space-y-4">
            {/* Panel Title */}
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Audit Investigation File
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {activeProductInventory?.productName || 'Select a Product'}
                </h3>
              </div>
              <Badge variant={activeProductInventory?.investigationStatus === 'COMPLETED' ? 'success' : 'warning'}>
                {activeProductInventory?.investigationStatus || 'PENDING'}
              </Badge>
            </div>

            {/* Discrepancy Breakdown Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Product SKU:</span>
                <span className="font-mono text-white">{activeProductInventory?.sku || '—'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Facility / Branch:</span>
                <span className="text-white">{selectedStore?.name || '—'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Unit Price:</span>
                <span className="font-bold text-white">{formatCurrency(activeProductInventory?.price || 0)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Expected Book Quantity:</span>
                <span className="font-bold text-white">{formatNumber(activeProductInventory?.expectedQuantity || 0)} units</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Actual Physical Count:</span>
                <span className="font-bold text-emerald-400">{formatNumber(activeProductInventory?.actualQuantity || 0)} units</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Shrinkage Discrepancy:</span>
                <span className="font-black text-rose-400">{formatNumber(activeProductInventory?.missingQuantity || 0)} units</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-300 font-semibold">Total Financial Loss:</span>
                <span className="font-black text-rose-400 text-sm">{formatCurrency(activeProductInventory?.financialImpact || 0)}</span>
              </div>
            </div>

            {/* Audit Notes & Findings */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Investigation Findings / Staff Logs:
              </label>
              <textarea
                rows={3}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Log root cause findings, supplier variance, staff audit observations..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons: Status Toggle & Live Adjustment */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {isManager ? (
                <>
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      activeProductInventory?.investigationStatus === 'PENDING'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:opacity-95'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:opacity-95'
                    }`}
                  >
                    {activeProductInventory?.investigationStatus === 'PENDING' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        MARK INVESTIGATION AS COMPLETED
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        RE-OPEN INVESTIGATION (SET TO PENDING)
                      </>
                    )}
                  </button>

                  {/* Interactive Stock Adjustment */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Adjust Stock Count (Commit to DB)
                      </span>
                      {!isEditingStock && (
                        <button
                          onClick={() => setIsEditingStock(true)}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Edit Count
                        </button>
                      )}
                    </div>

                    {isEditingStock && (
                      <form onSubmit={handleSaveStockAdjustment} className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          value={stockEditValue}
                          onChange={(e) => setStockEditValue(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-400"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingStock(false)}
                          className="rounded-xl border border-slate-700 px-2 py-1.5 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      Manager authorization: Saving stock writes directly to database and recalculates metrics and shrinkage.
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-xl bg-navy-900/90 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Operational Staff Access</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Staff members can inspect product records and submit new count audits. Status overrides and inventory commits require manager authorization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MANAGER: Adjustment Authorization Modal */}
      {selectedAdjustment && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Manager Adjustment Authorization"
        >
          <div className="space-y-4 text-xs">
            {adjustmentActionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-xs">
                {adjustmentActionSuccess}
              </div>
            )}
            {adjustmentActionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium text-xs">
                {adjustmentActionError}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-white text-sm">{selectedAdjustment.productName}</strong>
                <Badge variant="info">{selectedAdjustment.sku}</Badge>
              </div>
              <p className="text-slate-400 text-[11px]">
                Submitted by: <span className="text-white font-medium">{selectedAdjustment.staffUsername || 'Staff'}</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">System Expected</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatNumber(selectedAdjustment.systemQuantity)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 block">Physical Count</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatNumber(selectedAdjustment.physicalQuantity)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-400 block">Variance</span>
                <span className={`text-sm font-bold font-mono ${selectedAdjustment.difference < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {selectedAdjustment.difference}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Manager Review Comment / Authorization Note:
              </label>
              <textarea
                rows={2}
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Optional notes regarding approval or rejection reason..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                disabled={isProcessingAdjustment}
                onClick={() => handleApproveAdjustment(selectedAdjustment.id)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Commit</span>
              </button>
              <button
                disabled={isProcessingAdjustment}
                onClick={() => handleRejectAdjustment(selectedAdjustment.id)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Reject Request</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};