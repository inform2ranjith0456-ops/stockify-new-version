import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex">
      {/* Dynamic Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Layout Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Navbar */}
        <Navbar
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Routed Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-warehouse-grid overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
