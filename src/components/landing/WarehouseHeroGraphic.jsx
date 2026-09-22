import React from 'react';
import { Package, Warehouse, QrCode, ScanLine, ArrowRight, Shield, Layers } from 'lucide-react';

export const WarehouseHeroGraphic = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-gradient-to-b from-navy-850 to-navy-950 p-6 md:p-8 shadow-2xl shadow-black/80 overflow-hidden">
      {/* Laser Barcode Scanner Beam Effect */}
      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06B6D4] animate-scan z-20 pointer-events-none" />

      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar within the visual */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400">
            Vellore Central Facility // Live Automated Telemetry
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
          <ScanLine className="w-3.5 h-3.5 animate-pulse" />
          <span>RF-RFID ACTIVE</span>
        </div>
      </div>

      {/* Warehouse Racks and Shelves Visualization */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Rack 1: Grains & Staples */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-4 relative group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-mono text-[11px] text-cyan-400 font-semibold">BAY A-01</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Level 3</span>
          </div>
          {/* Animated Shelf Stack */}
          <div className="space-y-2">
            <div className="h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between px-3 transform group-hover:-translate-y-1 transition-transform">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Basmati Rice
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">1,145 bags</span>
            </div>
            <div className="h-10 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between px-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-400" /> Wheat Flour
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">1,470 bags</span>
            </div>
          </div>
          {/* Barcode Strip */}
          <div className="mt-3 h-3 w-full barcode-pattern rounded opacity-80" />
        </div>

        {/* Rack 2: Edible Oils & Essentials (With Warning indicator) */}
        <div className="rounded-2xl border border-amber-500/30 bg-navy-900/90 p-4 relative group hover:border-amber-500/50 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.08)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-mono text-[11px] text-amber-400 font-semibold">BAY B-02</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              High Shrinkage
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-10 rounded-xl bg-slate-800/80 border border-amber-500/40 flex items-center justify-between px-3 transform group-hover:-translate-y-1 transition-transform">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" /> Cooking Oil
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-semibold">840/900</span>
            </div>
            <div className="h-10 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between px-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Sugar 1kg
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">2,170 packs</span>
            </div>
          </div>
          <div className="mt-3 h-3 w-full barcode-pattern rounded opacity-80" />
        </div>

        {/* Rack 3: Dairy & Beverages */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-4 relative group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-mono text-[11px] text-cyan-400 font-semibold">BAY C-03</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Level 1</span>
          </div>
          <div className="space-y-2">
            <div className="h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between px-3 transform group-hover:-translate-y-1 transition-transform">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Whole Milk
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">790 cartons</span>
            </div>
            <div className="h-10 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between px-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-400" /> Assam Tea
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">1,085 boxes</span>
            </div>
          </div>
          <div className="mt-3 h-3 w-full barcode-pattern rounded opacity-80" />
        </div>
      </div>

      {/* Moving Package Conveyor Belt Graphic Animation */}
      <div className="relative rounded-xl border border-slate-800 bg-navy-950 p-3 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Conveyor Dispatch Line #4
          </span>
          <span className="font-mono text-[11px] text-cyan-400 animate-pulse">
            SORTING SPEED: 48 PKG/MIN
          </span>
        </div>

        {/* Animated Moving Boxes Track */}
        <div className="relative h-12 bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden flex items-center">
          <div className="flex gap-8 whitespace-nowrap animate-conveyor">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-slate-800 to-slate-750 border border-slate-700 shadow-md text-xs font-semibold text-white animate-float"
              >
                <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>BOX-VLR-0{n}</span>
                <span className="font-mono text-[10px] text-cyan-300">FRAGILE</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live System Capabilities Pill Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-300">
        <span className="flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/60 px-3 py-1">
          <Warehouse className="w-3.5 h-3.5 text-cyan-400" /> Multi-Store Sync
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/60 px-3 py-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> Shrinkage Prevention
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/60 px-3 py-1">
          <QrCode className="w-3.5 h-3.5 text-blue-400" /> Barcode Auditing
        </span>
      </div>
    </div>
  );
};
