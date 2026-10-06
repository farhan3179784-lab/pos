import { useState, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { InventoryTable } from '../features/inventory/components/InventoryTable';
import { InventoryFilters } from '../features/inventory/components/InventoryFilters';
import { StockAdjustModal } from '../features/inventory/components/StockAdjustModal';
import { StockHistoryModal } from '../features/inventory/components/StockHistoryModal';
import { useStore } from '../hooks/useStore';
import { calculateStockStatus } from '../utils/posCalculations';

export const InventoryPage = () => {
  const { products, inventoryLogs, isLoading, adjustStock } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState('all');

  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Metrics breakdown
  const metrics = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const status = calculateStockStatus(p.stock, p.threshold);
      if (status === 'out_of_stock') outOfStock += 1;
      else if (status === 'low_stock') lowStock += 1;
      else inStock += 1;
    });

    return { total: products.length, inStock, lowStock, outOfStock };
  }, [products]);

  // Filtered inventory items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All Categories' || p.category === selectedCategory;
      const status = calculateStockStatus(p.stock, p.threshold);
      const matchesStock = stockFilter === 'all' || status === stockFilter;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  if (isLoading) {
    return <LoadingSpinner message="Loading inventory ledger..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Stock Counts */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit inventory levels, log stock replenishment, and track shrinkage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            {metrics.inStock} In Stock
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
            {metrics.lowStock} Low Stock
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
            {metrics.outOfStock} Out of Stock
          </div>
        </div>
      </div>

      {/* Filters & Audit History Action */}
      <InventoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* Table or Empty State */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon="inventory"
          title="No inventory records found"
          description="Try adjusting your filter settings or search query."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All Categories');
            setStockFilter('all');
          }}
        />
      ) : (
        <InventoryTable
          products={filteredProducts}
          onAdjustStock={(prod) => setAdjustingProduct(prod)}
        />
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        onConfirmAdjust={adjustStock}
      />

      {/* Audit History Log Modal */}
      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        logs={inventoryLogs}
      />
    </div>
  );
};
