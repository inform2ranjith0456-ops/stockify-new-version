import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  TrendingUp,
  PieChart,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Boxes,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { logout, currentUser } = useAuth();
  const { selectedStore, pendingAdjustmentsCount } = useInventory();
  const navigate = useNavigate();

  const isManager = currentUser?.role === 'MANAGER';

  const navItems = isManager
    ? [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          description: 'System overview & live metrics',
        },
        {
          name: 'Stores',
          path: '/stores',
          icon: Store,
          description: 'Multi-branch facility management',
        },
        {
          name: 'Products',
          path: '/products',
          icon: Package,
          description: 'Master catalog & store stocks',
        },
        {
          name: 'Demand Forecast',
          path: '/demand-forecast',
          icon: TrendingUp,
          description: 'Sales trends & demand predictions',
        },
        {
          name: 'Shrinkage',
          path: '/shrinkage',
          icon: PieChart,
          description: 'Loss calculations & high shrinkage',
        },
        {
          name: 'Investigation',
          path: '/investigation',
          icon: ShieldAlert,
          description: 'Discrepancy audits & status resolution',
          badge: pendingAdjustmentsCount > 0 ? pendingAdjustmentsCount : null,
        },
      ]
    : [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          description: 'Assigned store telemetry & overview',
        },
        {
          name: 'Assigned Store',
          path: '/stores',
          icon: Store,
          description: 'Facility & rack operational data',
        },
        {
          name: 'Products',
          path: '/products',
          icon: Package,
          description: 'Stock view & physical count intake',
        },
        {
          name: 'Shrinkage',
          path: '/shrinkage',
          icon: PieChart,
          description: 'Store shrinkage metrics & reporting',
        },
        {
          name: 'Audit Submissions',
          path: '/investigation',
          icon: ClipboardList,
          description: 'My physical count submissions',
        },
      ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col border-r border-slate-800 bg-navy-850/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-extrabold tracking-wider text-white text-lg leading-tight">
                  STOCKIFY
                </span>
                <span className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase">
                  Smart Inventory
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Close for Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Store Indicator (When Expanded) */}
        {!isCollapsed && selectedStore && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
            <Store className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-white truncate">{selectedStore.name}</p>
              <p className="text-[10px] text-slate-400">{selectedStore.code}</p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <ChevronRight className="w-4 h-4 text-cyan-400" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Session & Logout Section */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          {!isCollapsed && currentUser && (
            <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs">
                  {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.username || currentUser.name}</p>
                  <p className="text-[10px] text-cyan-400 font-mono">{currentUser.roleId || currentUser.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0 text-rose-400" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;