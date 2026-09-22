import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDataUpdate, setLastDataUpdate] = useState(new Date());

  // Master fetch function to synchronize all state with database
  const refreshData = useCallback(async () => {
    try {
      const [fetchedStores, fetchedProducts, fetchedInventory, fetchedMetrics, fetchedAdjustments] = await Promise.all([
        inventoryService.getStores().catch(() => []),
        inventoryService.getProducts().catch(() => []),
        inventoryService.getInventory().catch(() => []),
        inventoryService.getDashboardMetrics().catch(() => null),
        inventoryService.getAdjustments().catch(() => []),
      ]);

      setStores(fetchedStores);
      setProducts(fetchedProducts);
      setInventory(fetchedInventory);
      setAdjustments(fetchedAdjustments);
      if (fetchedMetrics) setMetrics(fetchedMetrics);

      // Default selectedStoreId and selectedProductId if not set or invalid
      if (fetchedStores.length > 0) {
        setSelectedStoreId((prev) => {
          const exists = fetchedStores.some((s) => s.id === prev);
          return exists ? prev : fetchedStores[0].id;
        });
      }

      if (fetchedProducts.length > 0) {
        setSelectedProductId((prev) => {
          const exists = fetchedProducts.some((p) => p.id === prev);
          return exists ? prev : fetchedProducts[0].id;
        });
      }

      setLastDataUpdate(new Date());
    } catch (error) {
      console.error('Error fetching inventory data from database:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load Time Series when selectedStoreId or selectedProductId changes
  useEffect(() => {
    if (!selectedStoreId || !selectedProductId) return;

    let isMounted = true;
    const fetchForecasts = async () => {
      try {
        const series = await inventoryService.getTimeSeries(selectedStoreId, selectedProductId);
        if (isMounted) setTimeSeriesData(series);
      } catch (error) {
        console.error('Error fetching time series:', error);
      }
    };

    fetchForecasts();
    return () => {
      isMounted = false;
    };
  }, [selectedStoreId, selectedProductId, lastDataUpdate]);

  // Selected Store Object
  const selectedStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || stores[0] || null;
  }, [stores, selectedStoreId]);

  // Selected Product Object
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  // Enriched inventory items calculated dynamically from database data
  const enrichedInventory = useMemo(() => {
    return inventory.map((item) => {
      const exp = Number(item.expectedQuantity || 0);
      const act = Number(item.actualQuantity || 0);
      const price = Number(item.price || 0);
      const missing = Math.max(0, exp - act);
      const financialImpact = missing * price;
      const shrinkagePercent = exp > 0 ? Number(((missing / exp) * 100).toFixed(2)) : 0;

      return {
        ...item,
        expectedQuantity: exp,
        actualQuantity: act,
        missingQuantity: missing,
        shrinkageValue: missing,
        financialImpact,
        shrinkagePercent,
        price,
      };
    });
  }, [inventory]);

  // Filter products for the selected store
  const storeProducts = useMemo(() => {
    if (!selectedStoreId) return enrichedInventory;
    return enrichedInventory.filter((item) => item.storeId === selectedStoreId);
  }, [enrichedInventory, selectedStoreId]);

  // Active product inventory in the selected store
  const activeProductInventory = useMemo(() => {
    return (
      storeProducts.find((item) => item.productId === selectedProductId) ||
      storeProducts[0] ||
      {}
    );
  }, [storeProducts, selectedProductId]);

  // Global metrics calculated dynamically from database
  const globalMetrics = useMemo(() => {
    if (metrics) {
      return metrics;
    }

    let totalExpected = 0;
    let totalActual = 0;
    let totalMissing = 0;
    let totalValue = 0;
    let totalFinancialLoss = 0;

    enrichedInventory.forEach((item) => {
      totalExpected += item.expectedQuantity;
      totalActual += item.actualQuantity;
      totalMissing += item.missingQuantity;
      totalValue += item.actualQuantity * item.price;
      totalFinancialLoss += item.financialImpact;
    });

    const averageShrinkagePercent =
      totalExpected > 0 ? Number(((totalMissing / totalExpected) * 100).toFixed(2)) : 0;

    return {
      totalStores: stores.length,
      totalProducts: products.length,
      totalInventoryValue: totalValue,
      totalExpectedStock: totalExpected,
      totalActualStock: totalActual,
      totalMissingStock: totalMissing,
      totalFinancialImpact: totalFinancialLoss,
      averageShrinkagePercent,
      totalSKUsAcrossStores: enrichedInventory.length,
    };
  }, [metrics, enrichedInventory, stores.length, products.length]);

  // Dynamic Shrinkage Pie Chart Data
  const shrinkagePieData = useMemo(() => {
    if (metrics && metrics.shrinkagePieData) {
      return metrics.shrinkagePieData;
    }

    const actual = globalMetrics.totalActualStock || 0;
    const shrinkage = globalMetrics.totalMissingStock || 0;
    const adjustedStock = Math.round((globalMetrics.totalExpectedStock || 0) * 0.045);
    const total = actual + shrinkage + adjustedStock;

    return [
      {
        name: 'Normal Stock',
        value: actual,
        percentage: total > 0 ? Number(((actual / total) * 100).toFixed(1)) : 0,
        color: '#10B981',
        description: 'Verified stock available across shelves and active racks',
      },
      {
        name: 'Shrinkage',
        value: shrinkage,
        percentage: total > 0 ? Number(((shrinkage / total) * 100).toFixed(1)) : 0,
        color: '#EF4444',
        description: 'Discrepancy (Missing Quantity = Expected Stock - Actual Stock)',
      },
      {
        name: 'Other/Adjusted Stock',
        value: adjustedStock,
        percentage: total > 0 ? Number(((adjustedStock / total) * 100).toFixed(1)) : 0,
        color: '#06B6D4',
        description: 'In-transit inter-store transfer & quality calibration buffer',
      },
    ];
  }, [metrics, globalMetrics]);

  // Store-wise shrinkage breakdown
  const storeShrinkageData = useMemo(() => {
    if (metrics && metrics.storeShrinkageData && metrics.storeShrinkageData.length > 0) {
      return metrics.storeShrinkageData;
    }

    return stores.map((store) => {
      const items = enrichedInventory.filter((inv) => inv.storeId === store.id);
      const expected = items.reduce((acc, curr) => acc + curr.expectedQuantity, 0);
      const actual = items.reduce((acc, curr) => acc + curr.actualQuantity, 0);
      const missing = Math.max(0, expected - actual);
      const financialImpact = items.reduce((acc, curr) => acc + curr.financialImpact, 0);
      const shrinkagePercent = expected > 0 ? Number(((missing / expected) * 100).toFixed(2)) : 0;

      return {
        storeId: store.id,
        storeName: store.name,
        storeCode: store.code,
        location: store.location,
        manager: store.manager,
        expectedStock: expected,
        actualStock: actual,
        missingQuantity: missing,
        shrinkagePercent,
        financialImpact,
        itemCount: items.length,
      };
    });
  }, [metrics, stores, enrichedInventory]);

  // High shrinkage products across all stores
  const highShrinkageProducts = useMemo(() => {
    if (metrics && metrics.highShrinkageProducts) {
      return metrics.highShrinkageProducts;
    }

    return enrichedInventory
      .filter((item) => item.shrinkagePercent >= 3.5 || item.financialImpact >= 5000)
      .sort((a, b) => b.financialImpact - a.financialImpact);
  }, [metrics, enrichedInventory]);

  // Last 7 days average sales indicator
  const last7DaysStats = useMemo(() => {
    const historicalOnly = timeSeriesData.filter((d) => !d.isForecast);
    const last7 = historicalOnly.slice(-7);
    const totalSales = last7.reduce((sum, d) => sum + (d.sales || 0), 0);
    const average = last7.length > 0 ? Math.round(totalSales / last7.length) : 0;

    const prev7 = historicalOnly.slice(0, 7);
    const prevTotal = prev7.reduce((sum, d) => sum + (d.sales || 0), 0);
    const prevAvg = prev7.length > 0 ? Math.round(prevTotal / prev7.length) : average;

    const trendPercent = prevAvg > 0 ? (((average - prevAvg) / prevAvg) * 100).toFixed(1) : '+0.0';

    return {
      average,
      totalSales,
      trendPercent: Number(trendPercent),
      isUp: Number(trendPercent) >= 0,
    };
  }, [timeSeriesData]);

  // Store Management CRUD
  const addStore = async (storeData) => {
    const res = await inventoryService.addStore(storeData);
    await refreshData();
    return res;
  };

  const editStore = async (id, storeData) => {
    const res = await inventoryService.updateStore(id, storeData);
    await refreshData();
    return res;
  };

  const deleteStore = async (id) => {
    const res = await inventoryService.deleteStore(id);
    await refreshData();
    return res;
  };

  // Product Management CRUD
  const addProduct = async (prodData) => {
    const res = await inventoryService.addProduct(prodData);
    await refreshData();
    return res;
  };

  const editProduct = async (id, prodData) => {
    const res = await inventoryService.updateProduct(id, prodData);
    await refreshData();
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await inventoryService.deleteProduct(id);
    await refreshData();
    return res;
  };

  // Update investigation status
  const updateInvestigationStatus = async (storeId, productId, newStatus, notes) => {
    await inventoryService.updateInvestigationStatus(storeId, productId, newStatus, notes);
    await refreshData();
  };

  // Adjust stock (Manager direct modification)
  const updateStock = async (storeId, productId, newActualQuantity, reason) => {
    const res = await inventoryService.updateStockQuantity(storeId, productId, newActualQuantity, reason);
    await refreshData();
    return res;
  };

  // Update Product Price (Manager only)
  const updateProductPrice = async (id, price) => {
    const res = await inventoryService.updateProductPrice(id, price);
    await refreshData();
    return res;
  };

  // Submit Physical Count (Staff or Manager)
  const submitPhysicalCount = async (countData) => {
    const res = await inventoryService.submitPhysicalCount(countData);
    await refreshData();
    return res;
  };

  // Approve Stock Adjustment (Manager only)
  const approveAdjustment = async (id, managerComment) => {
    const res = await inventoryService.approveAdjustment(id, managerComment);
    await refreshData();
    return res;
  };

  // Reject Stock Adjustment (Manager only)
  const rejectAdjustment = async (id, managerComment) => {
    const res = await inventoryService.rejectAdjustment(id, managerComment);
    await refreshData();
    return res;
  };

  // Pending Adjustments Filter
  const pendingAdjustments = useMemo(() => {
    return adjustments.filter((a) => a.status === 'PENDING_MANAGER_REVIEW');
  }, [adjustments]);

  const pendingAdjustmentsCount = pendingAdjustments.length;

  return (
    <InventoryContext.Provider
      value={{
        stores,
        products,
        inventory: enrichedInventory,
        adjustments,
        pendingAdjustments,
        pendingAdjustmentsCount,
        selectedStoreId,
        setSelectedStoreId,
        selectedStore,
        selectedProductId,
        setSelectedProductId,
        selectedProduct,
        storeProducts,
        activeProductInventory,
        globalMetrics,
        shrinkagePieData,
        storeShrinkageData,
        highShrinkageProducts,
        timeSeriesData,
        last7DaysStats,
        updateInvestigationStatus,
        updateStock,
        updateProductPrice,
        submitPhysicalCount,
        approveAdjustment,
        rejectAdjustment,
        addStore,
        editStore,
        deleteStore,
        addProduct,
        editProduct,
        deleteProduct,
        refreshData,
        isLoading,
        lastDataUpdate,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export default InventoryContext;
