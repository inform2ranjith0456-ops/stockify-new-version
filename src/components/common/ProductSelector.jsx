import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ProductSelector = ({ className = '' }) => {
  const { storeProducts, selectedProductId, setSelectedProductId } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = storeProducts.filter((p) => {
    const name = String(p.productName || '').toLowerCase();
    const sku = String(p.sku || '').toLowerCase();
    const category = String(p.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || sku.includes(query) || category.includes(query);
  });

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search grocery products (e.g. Rice, Sugar)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-navy-850 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
        />
      </div>

      {/* Products Grid / Horizontal Scroll for 1 -> N products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredProducts.map((p) => {
          const isSelected = p.productId === selectedProductId;
          return (
            <button
              key={p.productId}
              onClick={() => setSelectedProductId(p.productId)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-glow-cyan'
                  : 'border-slate-800 bg-navy-850/90 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" />
              )}
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold truncate max-w-[80%]">
                  {String(p.sku || '').replace('GRO-', '')}
                </span>
                <Package className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <p className="text-xs font-bold text-white line-clamp-1">{p.shortName || p.productName}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatCurrency(p.price)}</span>
                <span className={`font-semibold ${p.actualQuantity < 600 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatNumber(p.actualQuantity)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSelector;
