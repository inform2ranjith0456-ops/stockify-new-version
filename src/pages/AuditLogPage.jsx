import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Clock, ArrowRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const AuditLogPage = () => {
  const navigate = useNavigate();
  const { auditLogs, setSelectedStoreId, setSelectedProductId, setSelectedStaffId } = useInventory();

  // Function to handle redirection to Investigation page
  const handleInspectAudit = (log) => {
    // 1. Set relevant state in Context so the Investigation page filters automatically
    if (setSelectedStoreId && log.storeId) setSelectedStoreId(log.storeId);
    if (setSelectedProductId && log.productId) setSelectedProductId(log.productId);
    if (setSelectedStaffId && log.staffId) setSelectedStaffId(log.staffId);

    // 2. Direct manager to the Investigation page
    navigate('/investigation', { state: { logId: log.id, auditData: log } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Staff Activity Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Activity stream tracking updates and submissions submitted exclusively by staff members.
          </p>
        </div>
      </div>

      {/* Audit Log Cards */}
      <div className="space-y-3">
        {auditLogs && auditLogs.length > 0 ? (
          auditLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => handleInspectAudit(log)}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-navy-850 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    UPDATED BY
                  </span>
                  <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {log.staffName || log.updatedBy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    UPDATED FROM
                  </span>
                  <p className="text-sm font-bold text-cyan-400">
                    {log.source || 'System / Direct'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock className="w-4 h-4" />
                <span>{log.timestamp}</span>
              </div>

              <div className="flex items-center gap-1 text-cyan-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                <span>Investigate Issue</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-2xl bg-navy-850">
            No staff updates logged yet.
          </div>
        )}
      </div>
    </div>
  );
};