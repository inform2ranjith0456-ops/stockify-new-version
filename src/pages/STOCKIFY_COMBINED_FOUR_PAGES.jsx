/**\n * STOCKIFY - COMBINED FOUR CORE INVENTORY MANAGEMENT PAGES\n * This single file combines all 4 core application pages:\n * 1. DashboardPage (Page 2)\n * 2. DemandForecastPage (Page 3)\n * 3. ShrinkagePage (Page 4)\n * 4. InvestigationPage (Page 5)\n */\n\n\n// ======================================================================\n// FILE: DashboardPage.jsx\n// ======================================================================\n\n﻿import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Package,
  IndianRupee,
  PieChart as PieIcon,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { CustomChartTooltip } from '../components/common/CustomChartTooltip';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export const DashboardPage = () => {
  const {
    stores,
    globalMetrics,
    shrinkagePieData,
    storeShrinkageData,
    highShrinkageProducts,
    lastDataUpdate,
  } = useInventory();

  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Enterprise Dashboard
            </h1>
            <Badge variant="info">Multi-Store Live View</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time stock valuation, dynamic shrinkage calculations, and centralized loss audits.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/demand-forecast')}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-850 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Demand Forecast</span>
          </button>

          <button
            onClick={() => navigate('/investigation')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-glow-cyan hover:opacity-95 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Investigation ({highShrinkageProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stores */}
        <StatCard
          title="Total Stores"
          value={globalMetrics.totalStores}
          subtitle="Active retail hubs in Vellore region"
          icon={Store}
          highlightColor="cyan"
        />

        {/* Total Products */}
        <StatCard
          title="Total Products"
          value={globalMetrics.totalProducts}
          subtitle={`${globalMetrics.totalSKUsAcrossStores} store SKU stock records`}
          icon={Package}
          highlightColor="blue"
        />

        {/* Total Inventory Value */}
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(globalMetrics.totalInventoryValue)}
          subtitle="Sum of actual verified on-hand stock"
          icon={IndianRupee}
          trend="+2.4% vs last week"
          trendPositive={true}
          highlightColor="emerald"
        />

        {/* Dynamic Shrinkage Percentage Card */}
        {/* Calculated directly from: (Total Missing Stock / Total Expected Stock) * 100 */}
        <StatCard
          title="Average Shrinkage"
          value={formatPercent(globalMetrics.averageShrinkagePercent)}
          subtitle={`Financial loss: ${formatCurrency(globalMetrics.totalFinancialImpact)}`}
          icon={PieIcon}
          trend={globalMetrics.averageShrinkagePercent > 3.0 ? 'Exceeds 3.0% threshold' : 'Optimal'}
          trendPositive={globalMetrics.averageShrinkagePercent <= 3.0}
          highlightColor={globalMetrics.averageShrinkagePercent > 3.0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Main Charts & Stores Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Shrinkage Pie Chart Card */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-cyan-400" />
                Dynamic Stock & Shrinkage Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized ratio of Normal Stock vs Shrinkage vs In-Transit/Adjusted Buffer
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Live Computed
            </span>
          </div>

          {/* Recharts Pie Chart */}
          <div className="h-64 sm:h-72 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shrinkagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                >
                  {shrinkagePieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#0F172A"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip type="pie" />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-xs text-slate-300 font-medium">
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-xs font-semibold uppercase text-slate-400">Shrinkage</span>
              <span className="text-2xl font-black text-rose-400">
                {formatPercent(globalMetrics.averageShrinkagePercent)}
              </span>
            </div>
          </div>

          {/* Legend Details Breakdown */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center">
            {shrinkagePieData.map((slice) => (
              <div key={slice.name} className="p-2 rounded-xl bg-navy-900/70 border border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block truncate">
                  {slice.name}
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {formatNumber(slice.value)}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {slice.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Store-Wise Shrinkage Performance Overview */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Store-Wise Shrinkage Comparison
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Formula: Shrinkage = Expected Stock − Actual Stock
              </p>
            </div>
            <button
              onClick={() => navigate('/shrinkage')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Store Rows */}
          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {storeShrinkageData.map((s) => {
              const isHigh = s.shrinkagePercent > 3.0;
              return (
                <div
                  key={s.storeId}
                  className="rounded-xl border border-slate-800 bg-navy-900/80 p-3.5 transition-colors hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{s.storeName}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.storeCode} • {s.location}</p>
                    </div>
                    <Badge variant={isHigh ? 'danger' : 'success'}>
                      {formatPercent(s.shrinkagePercent)} Loss
                    </Badge>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, s.shrinkagePercent * 15)}%` }}
                    />
                  </div>

                  {/* Numbers */}
                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-300">
                    <span>Expected: <strong className="text-white">{formatNumber(s.expectedStock)}</strong></span>
                    <span>Actual: <strong className="text-emerald-400">{formatNumber(s.actualStock)}</strong></span>
                    <span>Missing: <strong className="text-rose-400">{formatNumber(s.missingQuantity)}</strong></span>
                    <span>Impact: <strong className="text-rose-400">{formatCurrency(s.financialImpact)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom helper info */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Automated Centralized Reconciler
            </span>
            <span>Formula: Missing × Product Price</span>
          </div>
        </div>
      </div>

      {/* High Shrinkage Urgent Alerts Section */}
      <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Urgent High Shrinkage Items Across Stores
              </h2>
              <p className="text-xs text-slate-400">
                Products exceeding shrinkage thresholds requiring investigation.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/investigation')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Open Investigation Desk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Product Name</th>
                <th className="py-3 px-4">Store Location</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Missing Qty</th>
                <th className="py-3 px-4 text-right">Shrinkage %</th>
                <th className="py-3 px-4 text-right">Financial Impact</th>
                <th className="py-3 px-4 text-center rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {highShrinkageProducts.slice(0, 5).map((item) => (
                <tr key={`${item.storeId}-${item.productId}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {item.productName}
                    <span className="block text-[10px] font-mono text-cyan-400">{item.sku}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{item.storeName}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{formatNumber(item.expectedQuantity)}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-medium">{formatNumber(item.actualQuantity)}</td>
                  <td className="py-3 px-4 text-right text-rose-400 font-bold">{formatNumber(item.missingQuantity)}</td>
                  <td className="py-3 px-4 text-right text-amber-400 font-bold">{formatPercent(item.shrinkagePercent)}</td>
                  <td className="py-3 px-4 text-right text-rose-400 font-bold">{formatCurrency(item.financialImpact)}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={item.investigationStatus === 'COMPLETED' ? 'success' : 'warning'}>
                      {item.investigationStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
\n\n// ======================================================================\n// FILE: DemandForecastPage.jsx\n// ======================================================================\n\n﻿import React from 'react';
import {
  TrendingUp,
  Package,
  Calendar,
  IndianRupee,
  BarChart2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { StoreSelector } from '../components/common/StoreSelector';
import { ProductSelector } from '../components/common/ProductSelector';
import { Badge } from '../components/common/Badge';
import { CustomChartTooltip } from '../components/common/CustomChartTooltip';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export const DemandForecastPage = () => {
  const {
    selectedStore,
    selectedProduct,
    activeProductInventory,
    timeSeriesData,
    last7DaysStats,
  } = useInventory();

  // Next 7 days predicted total demand
  const forecastOnly = timeSeriesData.filter((d) => d.isForecast);
  const totalPredictedDemand = forecastOnly.reduce((sum, d) => sum + (d.predictedDemand || 0), 0);
  const next7DaysAvgDemand = forecastOnly.length > 0 ? Math.round(totalPredictedDemand / forecastOnly.length) : 0;

  // Historical only data for sales trend chart
  const historicalData = timeSeriesData.filter((d) => !d.isForecast);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Predictive Demand Forecast
            </h1>
            <Badge variant="primary">AI Time Series</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical point-of-sale volume combined with predictive neural demand modeling.
          </p>
        </div>

        {/* Store Selector */}
        <div className="w-full md:w-80">
          <StoreSelector />
        </div>
      </div>

      {/* Product Selector with Search & Grocery Grid */}
      <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            Select Grocery Product in {selectedStore?.name}
          </h2>
          <span className="text-xs text-slate-400">7 Core Grocery SKUs</span>
        </div>
        <ProductSelector />
      </div>

      {/* Active Selected Product Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Product Name */}
        <div className="rounded-xl border border-slate-800 bg-navy-850 p-3.5 col-span-2 sm:col-span-1 lg:col-span-2">
          <span className="text-[11px] font-mono text-cyan-400 uppercase">{activeProductInventory.sku}</span>
          <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
            {activeProductInventory.productName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{activeProductInventory.category} • {activeProductInventory.unit}</p>
        </div>

        {/* Current Stock */}
        <div className="rounded-xl border border-slate-800 bg-navy-850 p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">Current Stock</span>
          <p className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">
            {formatNumber(activeProductInventory.actualQuantity)}
          </p>
          <span className="text-[10px] text-slate-400">Exp: {formatNumber(activeProductInventory.expectedQuantity)} units</span>
        </div>

        {/* Price */}
        <div className="rounded-xl border border-slate-800 bg-navy-850 p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">Unit Price</span>
          <p className="text-lg sm:text-xl font-black text-white mt-0.5">
            {formatCurrency(activeProductInventory.price)}
          </p>
          <span className="text-[10px] text-slate-400">MRP Inclusive</span>
        </div>

        {/* Predicted Demand */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 shadow-glow-cyan">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-cyan-300 font-bold">Predicted Demand</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-cyan-300 mt-0.5">
            {formatNumber(next7DaysAvgDemand)} <span className="text-xs font-normal">units/day</span>
          </p>
          <span className="text-[10px] text-cyan-400/80">7-Day Total: {formatNumber(totalPredictedDemand)}</span>
        </div>

        {/* Last 7 Days Average Indicator */}
        <div className="rounded-xl border border-slate-800 bg-navy-850 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Last 7D Average</span>
            {last7DaysStats.isUp ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <p className="text-lg sm:text-xl font-black text-white mt-0.5">
            {formatNumber(last7DaysStats.average)} <span className="text-xs font-normal">units/day</span>
          </p>
          <span className={`text-[10px] font-semibold ${last7DaysStats.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {last7DaysStats.isUp ? '▲ +' : '▼ '}{last7DaysStats.trendPercent}% vs prior 7d
          </span>
        </div>
      </div>

      {/* Main Demand Graph (Historical vs Predicted Distinction) */}
      <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Demand Curve: Historical Demand vs Predicted Forecast
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              X-axis: Date & Day • Y-axis: Demand (Units). Solid Area: Past 14 Days. Dashed Glow: Next 7 Days Forecast.
            </p>
          </div>

          {/* Visual Legend Guide */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-6 rounded bg-blue-500 inline-block" />
              <span className="text-slate-300">Historical Demand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-6 rounded bg-cyan-400 border border-dashed border-white inline-block shadow-glow-cyan" />
              <span className="text-cyan-300 font-semibold">Predicted Demand (AI)</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                {/* Historical Gradient */}
                <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                {/* Forecast Gradient */}
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `${val}`}
              />

              {/* Dynamic Interactive Tooltip */}
              <Tooltip content={<CustomChartTooltip type="demand" />} />

              {/* Historical Demand Area */}
              <Area
                type="monotone"
                dataKey="historicalDemand"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#histGradient)"
                name="Historical Demand"
                connectNulls={false}
              />

              {/* Predicted Demand Area (Dashed and Highlighted) */}
              <Area
                type="monotone"
                dataKey="predictedDemand"
                stroke="#06B6D4"
                strokeWidth={3}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#forecastGradient)"
                name="Predicted Demand"
                connectNulls={false}
                dot={{ r: 4, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales Trend Graph */}
      <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Recent 14-Day Sales Trend
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily verified register units sold for {activeProductInventory.productName} in {selectedStore?.name}.
            </p>
          </div>
          <span className="text-xs text-slate-300 font-mono">
            Total 14D Sales: <strong className="text-emerald-400">{formatNumber(last7DaysStats.totalSales * 2)} units</strong>
          </span>
        </div>

        {/* Bar Chart for Sales Trend */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <Tooltip content={<CustomChartTooltip type="demand" />} />
              <Bar
                dataKey="sales"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="Sales Units"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
\n\n// ======================================================================\n// FILE: ShrinkagePage.jsx\n// ======================================================================\n\n﻿import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart as PieIcon,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Package,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  IndianRupee,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { CustomChartTooltip } from '../components/common/CustomChartTooltip';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export const ShrinkagePage = () => {
  const {
    globalMetrics,
    storeShrinkageData,
    highShrinkageProducts,
    setSelectedStoreId,
    setSelectedProductId,
  } = useInventory();

  const navigate = useNavigate();

  // Handle jump to Investigation for a specific product
  const handleInvestigateProduct = (storeId, productId) => {
    setSelectedStoreId(storeId);
    setSelectedProductId(productId);
    navigate('/investigation');
  };

  // Chart data for store comparison
  const storeComparisonData = storeShrinkageData.map((s) => ({
    name: s.storeCode,
    storeName: s.storeName,
    expectedStock: s.expectedStock,
    actualStock: s.actualStock,
    missingQuantity: s.missingQuantity,
    shrinkagePercent: s.shrinkagePercent,
    financialImpact: s.financialImpact,
    date: 'Current Cycle Audit',
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Loss & Shrinkage Analytics
            </h1>
            <Badge variant="danger">Discrepancy Control</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Store-by-store audits, variance formulas, and high-loss inventory containment.
          </p>
        </div>

        {/* Global Average Shrinkage Badge */}
        <div className="flex items-center gap-3 bg-navy-850 border border-slate-700/80 rounded-2xl p-3 px-4 shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Network Shrinkage Rate
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              {formatPercent(globalMetrics.averageShrinkagePercent)}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Global Formulas & Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Expected Stock"
          value={formatNumber(globalMetrics.totalExpectedStock)}
          subtitle="System recorded inventory book quantity"
          icon={Package}
          highlightColor="blue"
        />

        <StatCard
          title="Total Missing Quantity"
          value={formatNumber(globalMetrics.totalMissingStock)}
          subtitle="Formula: Expected Stock − Actual Stock"
          icon={AlertTriangle}
          highlightColor="amber"
        />

        <StatCard
          title="Total Financial Impact"
          value={formatCurrency(globalMetrics.totalFinancialImpact)}
          subtitle="Formula: Missing Quantity × Product Price"
          icon={IndianRupee}
          highlightColor="rose"
        />
      </div>

      {/* Dynamic Shrinkage Graph Across Stores */}
      <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Dynamic Shrinkage Graph: Expected vs Actual Stock
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover over bars to inspect detailed store audit metrics, shrinkage rate, and financial impact.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Expected Stock
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Actual Stock
            </span>
          </div>
        </div>

        {/* Recharts Bar Comparison */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={storeComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <Tooltip content={<CustomChartTooltip type="shrinkage" />} />
              <Bar dataKey="expectedStock" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Expected Stock" />
              <Bar dataKey="actualStock" fill="#10B981" radius={[4, 4, 0, 0]} name="Actual Stock" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Store-Wise Shrinkage Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Store-Wise Shrinkage Breakdown
          </h2>
          <span className="text-xs text-slate-400">{storeShrinkageData.length} Regional Stores</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {storeShrinkageData.map((store) => {
            const isHigh = store.shrinkagePercent > 3.0;
            return (
              <div
                key={store.storeId}
                className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4 hover:border-slate-700 transition-colors"
              >
                {/* Store Name & Location */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{store.storeName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{store.storeCode} • {store.location}</p>
                  </div>
                  <Badge variant={isHigh ? 'danger' : 'success'}>
                    {formatPercent(store.shrinkagePercent)}
                  </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Expected Stock</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {formatNumber(store.expectedStock)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Actual Stock</span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                      {formatNumber(store.actualStock)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Missing Qty</span>
                    <span className="text-sm font-bold text-rose-400 mt-0.5 block">
                      {formatNumber(store.missingQuantity)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Financial Impact</span>
                    <span className="text-sm font-bold text-rose-400 mt-0.5 block">
                      {formatCurrency(store.financialImpact)}
                    </span>
                  </div>
                </div>

                {/* Store Manager & Audit Note */}
                <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 flex items-center justify-between">
                  <span>Manager: <strong className="text-slate-300">{typeof store.manager === 'string' && store.manager.trim() ? store.manager.split('(')[0].trim() : 'Not Assigned'}</strong></span>
                  <button
                    onClick={() => {
                      setSelectedStoreId(store.storeId);
                      navigate('/investigation');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HIGH SHRINKAGE PRODUCTS SECTION */}
      <div className="rounded-2xl border border-amber-500/30 bg-navy-850 p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                HIGH SHRINKAGE PRODUCTS
              </h2>
              <p className="text-xs text-slate-400">
                Products with unusually high shrinkage requiring prioritized manager inspection and containment.
              </p>
            </div>
          </div>
          <Badge variant="warning">
            {highShrinkageProducts.length} Items Flagged
          </Badge>
        </div>

        {/* High Shrinkage Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Product Details</th>
                <th className="py-3 px-4">Store Location</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Missing</th>
                <th className="py-3 px-4 text-right">Shrinkage %</th>
                <th className="py-3 px-4 text-right">Financial Impact</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {highShrinkageProducts.map((item) => (
                <tr key={`${item.storeId}-${item.productId}`} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {item.productName}
                    <span className="block text-[10px] font-mono text-cyan-400">{item.sku} • {formatCurrency(item.price)}/unit</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {item.storeName}
                    <span className="block text-[10px] text-slate-500">{item.storeCode}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-300">{formatNumber(item.expectedQuantity)}</td>
                  <td className="py-3.5 px-4 text-right text-emerald-400 font-medium">{formatNumber(item.actualQuantity)}</td>
                  <td className="py-3.5 px-4 text-right text-rose-400 font-bold">{formatNumber(item.missingQuantity)}</td>
                  <td className="py-3.5 px-4 text-right text-amber-400 font-black text-sm">{formatPercent(item.shrinkagePercent)}</td>
                  <td className="py-3.5 px-4 text-right text-rose-400 font-black text-sm">{formatCurrency(item.financialImpact)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={item.investigationStatus === 'COMPLETED' ? 'success' : 'warning'}>
                      {item.investigationStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleInvestigateProduct(item.storeId, item.productId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500 transition-all"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
\n\n// ======================================================================\n// FILE: InvestigationPage.jsx\n// ======================================================================\n\n﻿import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Store,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Sliders,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatNumber, formatPercent, formatDateTime } from '../utils/formatters';

export const InvestigationPage = () => {
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    selectedStore,
    selectedProductId,
    setSelectedProductId,
    storeProducts,
    activeProductInventory,
    updateInvestigationStatus,
    updateStock,
    lastDataUpdate,
  } = useInventory();

  // Dynamic live clock for investigation logs
  const [currentTime, setCurrentTime] = useState(new Date());
  const [auditNotes, setAuditNotes] = useState('');
  const [stockEditValue, setStockEditValue] = useState('');
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeProductInventory) {
      setAuditNotes(activeProductInventory.notes || '');
      setStockEditValue(String(activeProductInventory.actualQuantity || 0));
      setIsEditingStock(false);
    }
  }, [activeProductInventory?.productId, activeProductInventory?.storeId]);

  // Toggle status between PENDING and COMPLETED
  const handleToggleStatus = () => {
    const newStatus =
      activeProductInventory.investigationStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    updateInvestigationStatus(
      selectedStoreId,
      activeProductInventory.productId,
      newStatus,
      auditNotes
    );
  };

  // Save stock adjustment
  const handleSaveStockAdjustment = (e) => {
    e.preventDefault();
    const qty = parseInt(stockEditValue, 10);
    if (!isNaN(qty) && qty >= 0) {
      updateStock(selectedStoreId, activeProductInventory.productId, qty);
      setIsEditingStock(false);
    }
  };

  // Filtered store products
  const filteredProducts = storeProducts.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || item.investigationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Loss Investigation Desk
            </h1>
            <Badge variant="warning">Audit & Resolution</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reconcile physical inventory discrepancies, update investigation statuses, and log audit resolutions.
          </p>
        </div>

        {/* Dynamic Live Timestamp */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-navy-850 px-4 py-2 text-xs text-slate-300 shadow-sm">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono">{formatDateTime(currentTime)}</span>
        </div>
      </div>

      {/* Step 1: Store Selection Tabs (Displays all 3 stores) */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Step 1: Select Facility / Store
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stores.map((s) => {
            const isSelected = s.id === selectedStoreId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStoreId(s.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-500 bg-navy-850 shadow-glow-cyan'
                    : 'border-slate-800 bg-navy-900/60 hover:border-slate-700 hover:bg-navy-850'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-400">{s.code}</span>
                  <Store className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <p className="text-sm font-bold text-white line-clamp-1">{s.name}</p>
                <p className="text-xs text-slate-400 mt-1">{s.location}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Investigation Table & Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Table Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4">
            {/* Table Search & Status Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Store Inventory Audit: {selectedStore?.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any product below to inspect its detailed audit file and toggle investigation status.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 sm:w-48 rounded-xl border border-slate-700 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            {/* Complete Investigation Information Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5 rounded-l-lg">Product Name</th>
                    <th className="py-3 px-2.5">Product ID</th>
                    <th className="py-3 px-2.5">Store</th>
                    <th className="py-3 px-2.5 text-right">Expected Qty</th>
                    <th className="py-3 px-2.5 text-right">Actual Qty</th>
                    <th className="py-3 px-2.5 text-right">Missing Qty</th>
                    <th className="py-3 px-2.5 text-right">Shrinkage Value</th>
                    <th className="py-3 px-2.5 text-right">Product Price</th>
                    <th className="py-3 px-2.5 text-right">Financial Impact</th>
                    <th className="py-3 px-2.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right rounded-r-lg">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProducts.map((p) => {
                    const isSelected = p.productId === selectedProductId;
                    return (
                      <tr
                        key={p.productId}
                        onClick={() => setSelectedProductId(p.productId)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/10 border-l-4 border-l-cyan-500'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">
                          {p.productName}
                        </td>
                        <td className="py-3 px-2.5 font-mono text-cyan-400 whitespace-nowrap">
                          {p.productId}
                        </td>
                        <td className="py-3 px-2.5 text-slate-300 whitespace-nowrap">
                          {p.storeCode}
                        </td>
                        <td className="py-3 px-2.5 text-right text-slate-300">
                          {formatNumber(p.expectedQuantity)}
                        </td>
                        <td className="py-3 px-2.5 text-right text-emerald-400 font-medium">
                          {formatNumber(p.actualQuantity)}
                        </td>
                        <td className="py-3 px-2.5 text-right text-rose-400 font-bold">
                          {formatNumber(p.missingQuantity)}
                        </td>
                        <td className="py-3 px-2.5 text-right font-mono font-bold text-amber-400">
                          {formatNumber(p.shrinkageValue)}
                        </td>
                        <td className="py-3 px-2.5 text-right text-slate-300">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-3 px-2.5 text-right font-bold text-rose-400 whitespace-nowrap">
                          {formatCurrency(p.financialImpact)}
                        </td>
                        <td className="py-3 px-2.5 text-center whitespace-nowrap">
                          <Badge variant={p.investigationStatus === 'COMPLETED' ? 'success' : 'warning'}>
                            {p.investigationStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {p.lastUpdated}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Product Information Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-cyan-500/30 bg-navy-850 p-5 shadow-card space-y-4">
            {/* Panel Title */}
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Audit Investigation File
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {activeProductInventory.productName}
                </h3>
              </div>
              <Badge variant={activeProductInventory.investigationStatus === 'COMPLETED' ? 'success' : 'warning'}>
                {activeProductInventory.investigationStatus}
              </Badge>
            </div>

            {/* Discrepancy Breakdown Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Product SKU:</span>
                <span className="font-mono text-white">{activeProductInventory.sku}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Facility / Branch:</span>
                <span className="text-white">{selectedStore?.name}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Unit Price:</span>
                <span className="font-bold text-white">{formatCurrency(activeProductInventory.price)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Expected Book Quantity:</span>
                <span className="font-bold text-white">{formatNumber(activeProductInventory.expectedQuantity)} units</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Actual Physical Count:</span>
                <span className="font-bold text-emerald-400">{formatNumber(activeProductInventory.actualQuantity)} units</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-navy-900 border border-slate-800">
                <span className="text-slate-400">Shrinkage Discrepancy:</span>
                <span className="font-black text-rose-400">{formatNumber(activeProductInventory.missingQuantity)} units</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-300 font-semibold">Total Financial Loss:</span>
                <span className="font-black text-rose-400 text-sm">{formatCurrency(activeProductInventory.financialImpact)}</span>
              </div>
            </div>

            {/* Audit Notes & Cause */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Investigation Findings / Notes:
              </label>
              <textarea
                rows={3}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Log root cause findings, supplier variance, or security verification..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons: Status Toggle & Live Recalculation */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeProductInventory.investigationStatus === 'PENDING'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:opacity-95'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md hover:opacity-95'
                }`}
              >
                {activeProductInventory.investigationStatus === 'PENDING' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    MARK INVESTIGATION AS COMPLETED
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    RE-OPEN INVESTIGATION (SET TO PENDING)
                  </>
                )}
              </button>

              {/* Interactive Stock Adjustment Simulator */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Adjust Stock Count (Test Live Update)
                  </span>
                  {!isEditingStock && (
                    <button
                      onClick={() => setIsEditingStock(true)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Edit Count
                    </button>
                  )}
                </div>

                {isEditingStock && (
                  <form onSubmit={handleSaveStockAdjustment} className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={stockEditValue}
                      onChange={(e) => setStockEditValue(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-400"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingStock(false)}
                      className="rounded-xl border border-slate-700 px-2 py-1.5 text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                  </form>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  Adjusting stock triggers instant live recalculation of shrinkage rates on Dashboard and Shrinkage charts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
\n