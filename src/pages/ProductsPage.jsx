import { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ProductCard } from '../features/products/components/ProductCard';
import { ProductTable } from '../features/products/components/ProductTable';
import { ProductFilters } from '../features/products/components/ProductFilters';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { AddToCartModal } from '../features/products/components/AddToCartModal';
import { useStore } from '../hooks/useStore';
import { useCart } from '../hooks/useCart';
import { calculateStockStatus } from '../utils/posCalculations';

export const ProductsPage = () => {
  const { products, isLoading, saveProduct, deleteProduct } = useStore();
  const { addItem } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name_asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [activeAddToCartProduct, setActiveAddToCartProduct] = useState(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'All Categories' || p.category === selectedCategory;
        const status = calculateStockStatus(p.stock, p.threshold);
        const matchesStock = stockFilter === 'all' || status === stockFilter;
        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
        if (sortOption === 'name_desc') return b.name.localeCompare(a.name);
        if (sortOption === 'price_asc') return a.price - b.price;
        if (sortOption === 'price_desc') return b.price - a.price;
        if (sortOption === 'stock_asc') return a.stock - b.stock;
        if (sortOption === 'stock_desc') return b.stock - a.stock;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortOption]);

  if (isLoading) {
    return <LoadingSpinner message="Loading product catalog..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {products.length} products registered • {filteredProducts.length} displayed
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon="plus"
          onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}
        >
          Add Product
        </Button>
      </div>

      {/* Filters Toolbar */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Product Content (Grid vs Table) */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon="search"
          title="No products match your criteria"
          description="Try modifying search keywords or resetting category and stock filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All Categories');
            setStockFilter('all');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(prod) => setActiveAddToCartProduct(prod)}
              onEdit={(prod) => { setEditingProduct(prod); setIsFormModalOpen(true); }}
              onDelete={(prod) => setDeletingProduct(prod)}
            />
          ))}
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onAddToCart={(prod) => setActiveAddToCartProduct(prod)}
          onEdit={(prod) => { setEditingProduct(prod); setIsFormModalOpen(true); }}
          onDelete={(prod) => setDeletingProduct(prod)}
        />
      )}

      {/* Weight & Unit Quantity Modal */}
      <AddToCartModal
        isOpen={Boolean(activeAddToCartProduct)}
        onClose={() => setActiveAddToCartProduct(null)}
        product={activeAddToCartProduct}
        onConfirm={({ product, quantity, calculatedTotal, unit }) => {
          addItem(product, quantity, {
            unit,
            calculatedTotal,
          });
        }}
      />

      {/* Add / Edit Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onSave={saveProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={async () => {
          if (deletingProduct) {
            await deleteProduct(deletingProduct.id);
            setDeletingProduct(null);
          }
        }}
        title="Delete Product?"
        description={`Are you sure you want to remove "${deletingProduct?.name}" (${deletingProduct?.sku})? This cannot be undone.`}
        confirmText="Yes, Delete Product"
      />
    </div>
  );
};
