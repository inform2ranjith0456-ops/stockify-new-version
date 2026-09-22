import React, { useState, useEffect } from 'react';
import { Menu, Boxes, Bell, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { formatDateTime } from '../../utils/formatters';

export const Navbar = ({ onToggleMobile, isCollapsed, onToggleCollapse }) => {
  const { currentUser } = useAuth();
  const { selectedStore } = useInventory();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Dynamic live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const displayName = currentUser?.username || currentUser?.name || 'Stockify User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-navy-900/90 px-4 md:px-6 backdrop-blur-xl">
      {/* Left section: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobile}
          className="flex lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Hamburger Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand Mark & Active Hub */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-400 hidden sm:inline">
            Active Hub:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {selectedStore?.name || 'Central Facility'}
          </span>
        </div>
      </div>

      {/* Right section: Dynamic Clock, Role Badge & User info */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Live Dynamic Date & Time */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-navy-850 px-3.5 py-1.5 text-xs text-slate-300 shadow-sm">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono">{formatDateTime(currentDateTime)}</span>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{currentUser?.role === 'STAFF' ? 'Inventory Staff' : 'Operations Manager'}</span>
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-navy-850 p-1.5 pr-3 text-xs">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-glow-cyan">
              {displayInitial}
            </div>
            <span className="font-medium text-white hidden sm:inline truncate max-w-[140px]">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
