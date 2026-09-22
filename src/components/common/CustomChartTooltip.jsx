import React from 'react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

export const CustomChartTooltip = ({ active, payload, label, type = 'demand' }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload || {};

  // Pie Chart Tooltip
  if (type === 'pie') {
    const item = payload[0];
    return (
      <div className="rounded-xl border border-slate-700 bg-navy-950/95 p-3.5 shadow-2xl backdrop-blur-md text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: item.payload?.color || item.color }}
          />
          <span className="text-sm text-white">{item.name}</span>
        </div>
        <div className="mt-2 space-y-1 text-slate-300">
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Stock Units:</span>
            <span className="font-semibold text-white">{formatNumber(item.value)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Share of Inventory:</span>
            <span className="font-semibold text-cyan-400">
              {formatPercent(item.payload?.percentage || 0)}
            </span>
          </div>
          {item.payload?.description && (
            <p className="mt-2 border-t border-slate-800 pt-1.5 text-[11px] text-slate-400 max-w-xs">
              {item.payload.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Demand Forecast Tooltip
  if (type === 'demand') {
    const isForecast = data.isForecast;
    const demandValue = isForecast ? data.predictedDemand : data.historicalDemand;

    return (
      <div className="rounded-xl border border-slate-700 bg-navy-950/95 p-3.5 shadow-2xl backdrop-blur-md text-xs min-w-[200px]">
        <div className="border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">
              {data.date} ({data.day})
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                isForecast
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {isForecast ? 'Predicted Forecast' : 'Historical Record'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{data.productName}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Demand Volume:</span>
            <span className="font-bold text-white text-sm">
              {formatNumber(demandValue)} units
            </span>
          </div>
          {!isForecast && data.sales !== null && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Actual Sales:</span>
              <span className="font-semibold text-emerald-400">
                {formatNumber(data.sales)} units
              </span>
            </div>
          )}
          {data.unitPrice && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Unit Price:</span>
              <span className="font-medium text-slate-300">
                {formatCurrency(data.unitPrice)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Shrinkage Store/Product Tooltip
  if (type === 'shrinkage') {
    return (
      <div className="rounded-xl border border-slate-700 bg-navy-950/95 p-3.5 shadow-2xl backdrop-blur-md text-xs min-w-[220px]">
        <div className="border-b border-slate-800 pb-2 mb-2">
          <p className="font-bold text-white text-sm">{data.storeName || data.storeCode || data.name}</p>
          <p className="text-[11px] text-slate-400">{data.date || 'Audit Cycle Count'}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Expected Stock:</span>
            <span className="font-medium text-slate-200">{formatNumber(data.expectedStock || data.expectedQuantity)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Actual Stock:</span>
            <span className="font-medium text-emerald-400">{formatNumber(data.actualStock || data.actualQuantity)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Missing Quantity:</span>
            <span className="font-bold text-rose-400">{formatNumber(data.missingQuantity)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Shrinkage Rate:</span>
            <span className="font-bold text-amber-400">{formatPercent(data.shrinkagePercent)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-800 pt-1.5">
            <span className="text-slate-400">Financial Impact:</span>
            <span className="font-bold text-rose-400">{formatCurrency(data.financialImpact)}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
