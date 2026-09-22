import React from 'react';
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
import { CustomChartTooltip } from '../components/common/CustomChartTooltip';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export const DemandForecastPage = () => {
  const {
    stores,
    products,
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
              Demand Forecast
            </h1>
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
          <span className="text-xs text-slate-400">{products.length} Products in Catalog</span>
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
              Date & Day vs Demand (Units). Solid Area: Past 14 Days. Dashed Glow: Next 7 Days Forecast.
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
              <Tooltip cursor={{ fill: 'transparent' }} content={<CustomChartTooltip type="demand" />} />

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
              <Tooltip cursor={{ fill: 'transparent' }} content={<CustomChartTooltip type="demand" />} />
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