import React, { useState } from 'react';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  User,
  Layers,
  Search,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Package,
  Users,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { inventoryService } from '../services/inventoryService';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { formatNumber } from '../utils/formatters';

export const StoresPage = () => {
  const { currentUser } = useAuth();
  const { stores, addStore, editStore, deleteStore, setSelectedStoreId } = useInventory();

  const isManager = currentUser?.role === 'MANAGER';
  const isStaff = currentUser?.role === 'STAFF';

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);

  // Staff Allocation Management Modal state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffAssignments, setStaffAssignments] = useState({});
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState('');
  const [staffError, setStaffError] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    address: '',
    manager: '',
    phone: '',
    activeRacks: 24,
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayStores =
    isStaff && currentUser?.storeId
      ? filteredStores.filter((s) => s.id === currentUser.storeId)
      : filteredStores;

  const handleOpenAdd = () => {
    setFormData({
      code: `VLR-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      location: 'Vellore Region, Tamil Nadu',
      address: '',
      manager: '',
      phone: '+91 98401 00000',
      activeRacks: 24,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (store) => {
    setCurrentStore(store);
    setFormData({
      code: store.code || '',
      name: store.name || '',
      location: store.location || '',
      address: store.address || '',
      manager: store.manager || '',
      phone: store.phone || '',
      activeRacks: store.activeRacks || 20,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (store) => {
    setCurrentStore(store);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setFormError('Store Name and Store Code are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await addStore(formData);
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to add store');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError('Store Name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await editStore(currentStore.id, formData);
      setIsEditModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update store');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStaffModal = async () => {
    setIsStaffModalOpen(true);
    setStaffLoading(true);
    setStaffSuccess('');
    setStaffError('');
    try {
      const list = await inventoryService.getStaffList();
      setStaffList(list || []);
      const assignments = {};
      (list || []).forEach((u) => {
        assignments[u.id] = u.storeId || (stores[0]?.id || '');
      });
      setStaffAssignments(assignments);
    } catch (err) {
      setStaffError(err.message || 'Failed to load staff accounts');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAssignStaff = async (staffId) => {
    const storeId = staffAssignments[staffId];
    if (!storeId) return;

    setStaffError('');
    setStaffSuccess('');

    try {
      await inventoryService.assignStaffStore(staffId, storeId);
      setStaffSuccess('Staff store assignment successfully updated in database!');
      const list = await inventoryService.getStaffList();
      setStaffList(list || []);
    } catch (err) {
      setStaffError(err.message || 'Failed to assign staff to store');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!currentStore) return;
    setIsSubmitting(true);

    try {
      await deleteStore(currentStore.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to delete store');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isManager ? 'Store & Branch Management' : 'Assigned Store Facility'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isManager
              ? 'Configure dynamic multi-branch retail network, depot facilities, active rack capacities, and staff allocations.'
              : 'Facility details, active storage racks, and operational hub information for your assigned branch.'}
          </p>
        </div>

        {/* Manager Action Buttons vs Staff Notice */}
        {isManager ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenStaffModal}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500 transition-all shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>STAFF ALLOCATIONS</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-95 transition-all w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW STORE</span>
            </button>
          </div>
        ) : (
          <Badge variant="success">Assigned Node Verified</Badge>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4 bg-navy-850 p-4 rounded-2xl border border-slate-800 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stores by name, code, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayStores.map((store) => (
          <div
            key={store.id}
            className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      {store.code}
                    </span>
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {store.name}
                    </h3>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons (Manager only) vs Staff Assigned Badge */}
                {isManager ? (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(store)}
                      title="Edit Store Information"
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(store)}
                      title="Delete Store"
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-rose-400 hover:border-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Badge variant="info">Assigned</Badge>
                )}
              </div>

              {/* Store Details List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{store.address || store.location}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Manager: <strong className="text-white">{store.manager || 'Unassigned'}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-400">{store.phone || '+91 98401 00000'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Metrics Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Racks</span>
                <p className="text-sm font-bold text-cyan-400 mt-0.5">{store.activeRacks || 24}</p>
              </div>

              <div className="p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tracked Items</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {store.totalProductsTracked || 'Active'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD STORE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Store / Facility"
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Store Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. VLR-NEW"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white uppercase font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Active Racks</label>
              <input
                type="number"
                min={1}
                value={formData.activeRacks}
                onChange={(e) => setFormData({ ...formData, activeRacks: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Store Facility Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ranipet Regional Supercenter"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Location Region</label>
            <input
              type="text"
              placeholder="e.g. Ranipet, Tamil Nadu"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Facility Address</label>
            <textarea
              rows={2}
              placeholder="Plot No, Industrial Zone..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Manager</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Varma"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 98401 23456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-glow-cyan disabled:opacity-50"
            >
              {isSubmitting ? 'Adding Store...' : 'Save Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STORE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Store: ${currentStore?.name}`}
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Store Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white uppercase font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Active Racks</label>
              <input
                type="number"
                min={1}
                value={formData.activeRacks}
                onChange={(e) => setFormData({ ...formData, activeRacks: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Location Region</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Manager</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-cyan-500 text-xs font-bold text-white shadow-glow-cyan disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Update Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Store Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300 text-sm">Delete {currentStore?.name}?</p>
              <p className="text-slate-400 mt-1">
                Removing this store will also cascade and remove associated inventory records for this branch. Staff accounts assigned to this store will become unassigned.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-md hover:bg-rose-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* STAFF ALLOCATIONS MODAL (MANAGER ONLY) */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Manage Staff Store Allocations"
        maxWidth="max-w-2xl"
      >
        {staffSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{staffSuccess}</span>
          </div>
        )}

        {staffError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{staffError}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <p className="text-slate-300">
              Only managers can allocate staff members to stores. Assigned staff are strictly isolated to their facility data and physical cycle counts.
            </p>
          </div>

          {staffLoading ? (
            <div className="py-8 text-center text-slate-400">
              Loading staff accounts...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg">Staff Member</th>
                    <th className="py-3 px-3">Current Store</th>
                    <th className="py-3 px-3">Reassign To</th>
                    <th className="py-3 px-3 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{st.username}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{st.email}</p>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={st.storeName ? 'info' : 'warning'}>
                          {st.storeName || 'Unassigned'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={staffAssignments[st.id] || ''}
                          onChange={(e) =>
                            setStaffAssignments((prev) => ({
                              ...prev,
                              [st.id]: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                        >
                          {stores.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleAssignStaff(st.id)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs transition-colors shadow-sm"
                        >
                          Save Assignment
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staffList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        No operational staff accounts registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsStaffModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StoresPage;