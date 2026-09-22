import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart as PieIcon,
  AlertTriangle,
  TrendingDown,
  Building2,
  Package,
  ArrowRight,
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
} from 'recharts';

import { useInventory } from '../context/InventoryContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { CustomChartTooltip } from '../components/common/CustomChartTooltip';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../utils/formatters';

export const ShrinkagePage = () => {
  const {
    globalMetrics,
    storeShrinkageData,
    highShrinkageProducts,
    setSelectedStoreId,
    setSelectedProductId,
  } = useInventory();

  const navigate = useNavigate();

  // -------------------------------------------------------
  // Safe fallback values
  // -------------------------------------------------------

  const safeGlobalMetrics = globalMetrics || {
    averageShrinkagePercent: 0,
    totalExpectedStock: 0,
    totalMissingStock: 0,
    totalFinancialImpact: 0,
  };

  const safeStoreShrinkageData = Array.isArray(storeShrinkageData)
    ? storeShrinkageData
    : [];

  const safeHighShrinkageProducts = Array.isArray(highShrinkageProducts)
    ? highShrinkageProducts
    : [];

  // -------------------------------------------------------
  // Handle jump to Investigation for a specific product
  // -------------------------------------------------------

  const handleInvestigateProduct = (storeId, productId) => {
    setSelectedStoreId(storeId);
    setSelectedProductId(productId);
    navigate('/investigation');
  };

  // -------------------------------------------------------
  // Chart data for store comparison
  // -------------------------------------------------------

  const storeComparisonData = safeStoreShrinkageData.map((store) => ({
    name: store.storeCode || store.storeId || 'N/A',
    storeName: store.storeName || 'Unknown Store',
    expectedStock: Number(store.expectedStock) || 0,
    actualStock: Number(store.actualStock) || 0,
    missingQuantity: Number(store.missingQuantity) || 0,
    shrinkagePercent: Number(store.shrinkagePercent) || 0,
    financialImpact: Number(store.financialImpact) || 0,
    date: store.date || 'Current Cycle Audit',
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">

        <div>
          <div className="flex items-center gap-2">

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Loss & Shrinkage Analytics
            </h1>

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
              {formatPercent(
                safeGlobalMetrics.averageShrinkagePercent
              )}
            </div>

          </div>

          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>

        </div>

      </div>

      {/* =====================================================
          GLOBAL FORMULAS & METRICS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <StatCard
          title="Total Expected Stock"
          value={formatNumber(
            safeGlobalMetrics.totalExpectedStock
          )}
          subtitle="System recorded inventory book quantity"
          icon={Package}
          highlightColor="blue"
        />

        <StatCard
          title="Total Missing Quantity"
          value={formatNumber(
            safeGlobalMetrics.totalMissingStock
          )}
          subtitle="Expected Stock − Actual Stock"
          icon={AlertTriangle}
          highlightColor="amber"
        />

        <StatCard
          title="Total Financial Impact"
          value={formatCurrency(
            safeGlobalMetrics.totalFinancialImpact
          )}
          subtitle="Missing Quantity × Product Price"
          icon={IndianRupee}
          highlightColor="rose"
        />

      </div>

      {/* =====================================================
          SHRINKAGE GRAPH
      ===================================================== */}

      <div className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">

          <div>

            <h2 className="text-base font-bold text-white flex items-center gap-2">

              <PieIcon className="w-4 h-4 text-cyan-400" />

              Shrinkage Graph: Expected vs Actual Stock

            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Hover over bars to inspect detailed store audit metrics, shrinkage rate, and financial impact.
            </p>

          </div>

          <div className="flex items-center gap-3 text-xs">

            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
              Expected Stock
            </span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              Actual Stock
            </span>

          </div>

        </div>

        {/* Recharts Bar Comparison */}

        <div className="h-72 sm:h-80 w-full">

          {storeComparisonData.length > 0 ? (

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={storeComparisonData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1E293B"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{
                    stroke: '#334155',
                  }}
                />

                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{
                    stroke: '#334155',
                  }}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={
                    <CustomChartTooltip type="shrinkage" />
                  }
                />

                <Bar
                  dataKey="expectedStock"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Expected Stock"
                />

                <Bar
                  dataKey="actualStock"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  name="Actual Stock"
                />

              </BarChart>

            </ResponsiveContainer>

          ) : (

            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No store shrinkage data available.
            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          STORE-WISE SHRINKAGE
      ===================================================== */}

      <div className="space-y-3">

        <div className="flex items-center justify-between">

          <h2 className="text-lg font-bold text-white flex items-center gap-2">

            <Building2 className="w-5 h-5 text-cyan-400" />

            Store-Wise Shrinkage Breakdown

          </h2>

          <span className="text-xs text-slate-400">
            {safeStoreShrinkageData.length}{' '}
            {safeStoreShrinkageData.length === 1
              ? 'Store'
              : 'Stores'}
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {safeStoreShrinkageData.length > 0 ? (

            safeStoreShrinkageData.map((store) => {

              const isHigh =
                Number(store.shrinkagePercent || 0) > 3.0;

              const managerName =
                typeof store.manager === 'string' &&
                store.manager.trim().length > 0
                  ? store.manager.split('(')[0].trim()
                  : 'Not Assigned';

              return (

                <div
                  key={
                    store.storeId ||
                    store.storeCode ||
                    store.storeName
                  }
                  className="rounded-2xl border border-slate-800 bg-navy-850 p-5 shadow-card space-y-4 hover:border-slate-700 transition-colors"
                >

                  {/* Store Name & Location */}

                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">

                    <div>

                      <h3 className="text-base font-bold text-white">
                        {store.storeName || 'Unknown Store'}
                      </h3>

                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {store.storeCode || store.storeId || 'N/A'}
                        {' • '}
                        {store.location || 'Location unavailable'}
                      </p>

                    </div>

                    <Badge
                      variant={
                        isHigh
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {formatPercent(
                        Number(store.shrinkagePercent) || 0
                      )}
                    </Badge>

                  </div>

                  {/* Metrics Grid */}

                  <div className="grid grid-cols-2 gap-3 text-xs">

                    <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">

                      <span className="text-slate-400 block text-[11px]">
                        Expected Stock
                      </span>

                      <span className="text-sm font-bold text-white mt-0.5 block">
                        {formatNumber(
                          Number(store.expectedStock) || 0
                        )}
                      </span>

                    </div>

                    <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">

                      <span className="text-slate-400 block text-[11px]">
                        Actual Stock
                      </span>

                      <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                        {formatNumber(
                          Number(store.actualStock) || 0
                        )}
                      </span>

                    </div>

                    <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">

                      <span className="text-slate-400 block text-[11px]">
                        Missing Qty
                      </span>

                      <span className="text-sm font-bold text-rose-400 mt-0.5 block">
                        {formatNumber(
                          Number(store.missingQuantity) || 0
                        )}
                      </span>

                    </div>

                    <div className="p-2.5 rounded-xl bg-navy-900/80 border border-slate-800">

                      <span className="text-slate-400 block text-[11px]">
                        Financial Impact
                      </span>

                      <span className="text-sm font-bold text-rose-400 mt-0.5 block">
                        {formatCurrency(
                          Number(store.financialImpact) || 0
                        )}
                      </span>

                    </div>

                  </div>

                  {/* Store Manager & Audit Note */}

                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 flex items-center justify-between">

                    <span>
                      Manager:{' '}

                      <strong className="text-slate-300">
                        {managerName}
                      </strong>

                    </span>

                    <button
                      onClick={() => {
                        setSelectedStoreId(
                          store.storeId
                        );

                        navigate('/investigation');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >

                      <span>
                        Investigate
                      </span>

                      <ArrowRight className="w-3 h-3" />

                    </button>

                  </div>

                </div>

              );
            })

          ) : (

            <div className="md:col-span-3 rounded-2xl border border-slate-800 bg-navy-850 p-8 text-center">

              <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />

              <p className="text-sm text-slate-400">
                No store shrinkage data available.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          HIGH SHRINKAGE PRODUCTS
      ===================================================== */}

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
            {safeHighShrinkageProducts.length} Items Flagged
          </Badge>

        </div>

        {/* High Shrinkage Table */}

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px]">

              <tr>

                <th className="py-3 px-4 rounded-l-lg">
                  Product Details
                </th>

                <th className="py-3 px-4">
                  Store Location
                </th>

                <th className="py-3 px-4 text-right">
                  Expected
                </th>

                <th className="py-3 px-4 text-right">
                  Actual
                </th>

                <th className="py-3 px-4 text-right">
                  Missing
                </th>

                <th className="py-3 px-4 text-right">
                  Shrinkage %
                </th>

                <th className="py-3 px-4 text-right">
                  Financial Impact
                </th>

                <th className="py-3 px-4 text-center">
                  Status
                </th>

                <th className="py-3 px-4 text-right rounded-r-lg">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800/80">

              {safeHighShrinkageProducts.length > 0 ? (

                safeHighShrinkageProducts.map((item) => (

                  <tr
                    key={`${item.storeId || 'store'}-${item.productId || 'product'}`}
                    className="hover:bg-slate-800/50 transition-colors"
                  >

                    <td className="py-3.5 px-4 font-semibold text-white">

                      {item.productName || 'Unknown Product'}

                      <span className="block text-[10px] font-mono text-cyan-400">

                        {item.sku || 'N/A'}
                        {' • '}
                        {formatCurrency(
                          Number(item.price) || 0
                        )}
                        /unit

                      </span>

                    </td>

                    <td className="py-3.5 px-4 text-slate-300">

                      {item.storeName || 'Unknown Store'}

                      <span className="block text-[10px] text-slate-500">
                        {item.storeCode || 'N/A'}
                      </span>

                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {formatNumber(
                        Number(item.expectedQuantity) || 0
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-emerald-400 font-medium">
                      {formatNumber(
                        Number(item.actualQuantity) || 0
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-rose-400 font-bold">
                      {formatNumber(
                        Number(item.missingQuantity) || 0
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-amber-400 font-black text-sm">
                      {formatPercent(
                        Number(item.shrinkagePercent) || 0
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-rose-400 font-black text-sm">
                      {formatCurrency(
                        Number(item.financialImpact) || 0
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">

                      <Badge
                        variant={
                          item.investigationStatus ===
                          'COMPLETED'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {item.investigationStatus ||
                          'PENDING'}
                      </Badge>

                    </td>

                    <td className="py-3.5 px-4 text-right">

                      <button
                        onClick={() =>
                          handleInvestigateProduct(
                            item.storeId,
                            item.productId
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500 transition-all"
                      >

                        <span>
                          Investigate
                        </span>

                        <ArrowRight className="w-3 h-3" />

                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="py-10 text-center text-slate-400"
                  >
                    No high-shrinkage products found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};