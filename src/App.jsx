import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginLandingPage } from './pages/LoginLandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { StoresPage } from './pages/StoresPage';
import { ProductsPage } from './pages/ProductsPage';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { ShrinkagePage } from './pages/ShrinkagePage';
import { InvestigationPage } from './pages/InvestigationPage';
import { StaffPortalPage } from './pages/StaffPortalPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { AppLayout } from './components/layout/AppLayout';
import { Loader2 } from 'lucide-react';

// Route Guard for Authenticated Users (Both Manager & Staff)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route Guard specifically for Manager Only Pages (e.g. Audit Log)
const ManagerOnlyRoute = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-400">Verifying security clearance...</p>
      </div>
    );
  }

  if (!isAuthenticated || currentUser?.role !== 'MANAGER') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route Guard for Dedicated Staff Quick Intake Portal
const StaffRoute = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-400">Verifying staff node...</p>
      </div>
    );
  }

  if (!isAuthenticated || currentUser?.role !== 'STAFF') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LoginLandingPage />} />

      {/* Dedicated Staff Portal */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffPortalPage />
          </StaffRoute>
        }
      />

      {/* Authenticated Application Shell (Role-Aware for Manager and Staff) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/demand-forecast" element={<DemandForecastPage />} />
        <Route path="/shrinkage" element={<ShrinkagePage />} />
        <Route path="/investigation" element={<InvestigationPage />} />

        {/* Manager Dominant Access Only: Full Audit Log */}
        <Route
          path="/audit-log"
          element={
            <ManagerOnlyRoute>
              <AuditLogPage />
            </ManagerOnlyRoute>
          }
        />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
