import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  IndianRupee,
  Barcode,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Filter,
  CheckCircle2,
  ClipboardCheck,
  Send,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const ProductsPage = () => {
  const { currentUser } = useAuth();
  const {
    products,
    inventory,
    addProduct,
    editProduct,
    deleteProduct,
    updateProductPrice,
    submitPhysicalCount,
    stores,
  } = useInventory();

  const isManager = currentUser?.role === 'MANAGER';
  const isStaff = currentUser?.role === 'STAFF';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Manager Price Edit Modal state
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceSuccess, setPriceSuccess] = useState('');
  const [priceError, setPriceError] = useState('');

  // Staff Physical Count Modal state
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [countProduct, setCountProduct] = useState(null);
  const [physicalQuantity, setPhysicalQuantity] = useState('');
  const [countReason, setCountReason] = useState('Damaged Stock');
  const [countNotes, setCountNotes] = useState('');
  const [countSuccess, setCountSuccess] = useState('');
  const [countError, setCountError] = useState('');

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    shortName: '',
    category: 'Grains & Staples',
    unit: 'Bag (5kg)',
    price: 150,
    barcode: '',
    minSafeStock: 200,
    initialQuantity: 1000,
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique categories from actual products
  const categories = ['ALL', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.shortName && p.shortName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      sku: `GRO-ITEM-${randomSuffix}`,
      name: '',
      shortName: '',
      category: 'Grains & Staples',
      unit: 'Pack (1kg)',
      price: 120,
      barcode: `89010300${randomSuffix}001`,
      minSafeStock: 150,
      initialQuantity: 1000,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      shortName: product.shortName || '',
      category: product.category || 'General',
      unit: product.unit || 'Unit',
      price: product.price || 0,
      barcode: product.barcode || '',
      minSafeStock: product.minSafeStock || 100,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.name || formData.price === undefined) {
      setFormError('SKU, Product Name, and Price are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await addProduct(formData);
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined) {
      setFormError('Product Name and Price are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await editProduct(currentProduct.id, formData);
      setIsEditModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!currentProduct) return;
    setIsSubmitting(true);

    try {
      await deleteProduct(currentProduct.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPriceModal = (product) => {
    setCurrentProduct(product);
    setNewPrice(String(product.price || ''));
    setPriceSuccess('');
    setPriceError('');
    setIsPriceModalOpen(true);
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(newPrice);
    if (isNaN(parsed) || parsed < 0) {
      setPriceError('Please enter a valid non-negative price.');
      return;
    }

    setIsSubmitting(true);
    setPriceError('');
    setPriceSuccess('');

    try {
      await updateProductPrice(currentProduct.id, parsed);
      setPriceSuccess(`Price updated to ₹${parsed} successfully!`);
      setTimeout(() => {
        setIsPriceModalOpen(false);
      }, 1200);
    } catch (err) {
      setPriceError(err.message || 'Failed to update price');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStaffCount = (product) => {
    if (!product) return;
    setCurrentProduct(product);
    setCountProduct(product);
    const staffInv = inventory.find(
      (inv) => inv.productId === product.id && (!currentUser?.storeId || inv.storeId === currentUser.storeId)
    );
    setPhysicalQuantity(staffInv ? String(staffInv.actualQuantity ?? '') : '');
    setCountReason('Damaged Stock');
    setCountNotes('');
    setCountSuccess('');
    setCountError('');
    setIsCountModalOpen(true);
  };

  const handleStaffCountSubmit = async (e) => {
    e.preventDefault();
    if (!countProduct || physicalQuantity === '') {
      setCountError('Please enter the physically verified count.');
      return;
    }

    setIsSubmitting(true);
    setCountError('');
    setCountSuccess('');

    try {
      await submitPhysicalCount({
        productId: countProduct.id,
        storeId: currentUser?.storeId,
        actualQuantity: Number(physicalQuantity),
        reason: countReason,
        notes: countNotes || 'Submitted from Products Catalog View',
      });

      setCountSuccess(`Physical count submitted for ${countProduct.name}! Pending Manager Review.`);
      setTimeout(() => {
        setIsCountModalOpen(false);
      }, 1400);
    } catch (err) {
      setCountError(err.message || 'Failed to submit physical count');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Product Catalog
            </h1>
            {!isManager && (
              <Badge variant="info">Store Catalog View</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isManager
              ? 'Dynamic database-driven catalog: add products, modify retail prices, and manage central inventory.'
              : 'Assigned store catalog: view master details, checked-in items, and submit verified physical counts.'}
          </p>
        </div>

        {/* Action Button: Manager Add Product vs Staff Quick Count */}
        {isManager ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-95 transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW PRODUCT</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="info">Read-Only Catalog</Badge>
            <button
              onClick={() => handleOpenStaffCount(filteredProducts[0] || null)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-glow-cyan hover:opacity-95 active:scale-95 transition-all w-fit"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Submit Physical Count</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-navy-850 p-4 rounded-2xl border border-slate-800 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 rounded-l-lg">Product Details</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Packaging Unit</th>
                <th className="py-3.5 px-3 text-right">Price (₹)</th>
                <th className="py-3.5 px-3 text-right">Min Safe Stock</th>
                <th className="py-3.5 px-3 text-right">Total Verified Stock</th>
                <th className="py-3.5 px-3 font-mono">Barcode</th>
                <th className="py-3.5 px-4 text-center rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{p.name}</p>
                        <span className="font-mono text-[11px] text-cyan-400 font-semibold">{p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-[11px]">
                      {p.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">{p.unit || 'Unit'}</td>
                  <td className="py-3.5 px-3 text-right font-bold text-white text-sm">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                    {formatNumber(p.minSafeStock)} units
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-400 font-mono">
                    {formatNumber(p.totalActualStock || 0)}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">
                    {p.barcode || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {isManager ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPriceModal(p)}
                          title="Update Price (Manager Only)"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product Details"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(p)}
                          title="Delete Product"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-rose-400 hover:border-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenStaffCount(p)}
                        className="px-2.5 py-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-bold transition-all flex items-center justify-center gap-1 mx-auto"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Submit Count</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Master Product"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. GRO-DAL-008"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white uppercase font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Pulses & Dals"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Toor Dal Premium Unpolished (1kg)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Short Name</label>
              <input
                type="text"
                placeholder="Toor Dal"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                placeholder="Pack (1kg)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹) *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Barcode</label>
              <input
                type="text"
                placeholder="89010300..."
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Min Safe Stock</label>
              <input
                type="number"
                min={0}
                value={formData.minSafeStock}
                onChange={(e) => setFormData({ ...formData, minSafeStock: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Initial Stock Allocation per Store
            </label>
            <input
              type="number"
              min={0}
              value={formData.initialQuantity}
              onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Will automatically map and initialize inventory for all {stores.length} existing store facilities.
            </p>
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
              {isSubmitting ? 'Creating Product...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Product: ${currentProduct?.name}`}
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Name *</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white uppercase font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹) *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Min Safe Stock</label>
              <input
                type="number"
                min={0}
                value={formData.minSafeStock}
                onChange={(e) => setFormData({ ...formData, minSafeStock: e.target.value })}
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
              {isSubmitting ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Product Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300 text-sm">Delete {currentProduct?.name}?</p>
              <p className="text-slate-400 mt-1">
                Removing this product will also remove its inventory and forecasting records across all stores.
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

      {/* MANAGER PRICE EDIT MODAL */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        title="Update Product Retail Price"
        maxWidth="max-w-md"
      >
        {priceSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{priceSuccess}</span>
          </div>
        )}

        {priceError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{priceError}</span>
          </div>
        )}

        <form onSubmit={handlePriceSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
            <p className="font-bold text-white text-sm">{currentProduct?.name}</p>
            <p className="font-mono text-cyan-400 text-[11px] mt-0.5">{currentProduct?.sku} • {currentProduct?.category}</p>
            <div className="mt-2 flex items-center justify-between text-slate-300">
              <span>Current Price:</span>
              <strong className="text-white text-sm">{formatCurrency(currentProduct?.price || 0)}</strong>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              New Unit Price (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number"
                min={0}
                step="any"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Manager authorization: Price change will be written to database and logged to audit trail.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPriceModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-glow-emerald disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Price'}
            </button>
          </div>
        </form>
      </Modal>

      {/* STAFF PHYSICAL COUNT MODAL */}
      <Modal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        title="Submit Physical Count Verification"
        maxWidth="max-w-md"
      >
        {countSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{countSuccess}</span>
          </div>
        )}

        {countError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{countError}</span>
          </div>
        )}

        <form onSubmit={handleStaffCountSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Product *</label>
            <select
              value={countProduct?.id || ''}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) handleOpenStaffCount(found);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {filteredProducts.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Physical Verified Quantity *</label>
            <input
              type="number"
              min={0}
              required
              value={physicalQuantity}
              onChange={(e) => setPhysicalQuantity(e.target.value)}
              placeholder="e.g. 150"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Variance Reason</label>
            <select
              value={countReason}
              onChange={(e) => setCountReason(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Damaged Stock">Damaged Stock</option>
              <option value="Physical Theft">Physical Theft / Shrinkage</option>
              <option value="Audit Adjustment">Audit Adjustment</option>
              <option value="Expired Product">Expired Product</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Audit Remarks</label>
            <textarea
              rows={2}
              value={countNotes}
              onChange={(e) => setCountNotes(e.target.value)}
              placeholder="Optional detail for store manager review..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCountModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-glow-cyan disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Count'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};