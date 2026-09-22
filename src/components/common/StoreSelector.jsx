import React from 'react';
import { Store, ChevronDown } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const StoreSelector = ({ className = '' }) => {
  const { stores, selectedStoreId, setSelectedStoreId } = useInventory();

  return (
    <div className={`relative ${className}`}>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Store className="w-3.5 h-3.5 text-cyan-400" />
        Select Branch / Store
      </label>
      <div className="relative">
        <select
          value={selectedStoreId || ''}
          onChange={(e) => setSelectedStoreId(Number(e.target.value) || e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-700 bg-navy-850 px-4 py-2.5 pr-10 text-sm font-medium text-white shadow-sm hover:border-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id} className="bg-navy-900 text-white">
              {store.name} ({store.code})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default StoreSelector;
