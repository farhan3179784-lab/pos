import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ProductCard } from '../features/products/components/ProductCard';
import { ProductTable } from '../features/products/components/ProductTable';
import { ProductFilters } from '../features/products/components/ProductFilters';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { ProductSalesModal } from '../features/sales/components/ProductSalesModal';
import { OrderDetailModal } from '../features/sales/components/OrderDetailModal';
import { useStore } from '../hooks/useStore';
import { calculateStockStatus } from '../utils/posCalculations';
import { Icon } from '../components/ui/Icon';
import { matchesProduct } from '../utils/searchMatcher';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, orders, isLoading, saveProduct, deleteProduct, resetProducts } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name_asc');
  const [viewMode, setViewMode] = useState('table'); // Default to table for easy POS view

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [salesProduct, setSalesProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = !searchQuery.trim() || matchesProduct(p, searchQuery);
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
    return <LoadingSpinner message="پروڈکٹس لوڈ ہو رہے ہیں..." />;
  }

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-sm font-extrabold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-black text-sm px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar (Large, Clear Fonts) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Icon name="products" size={24} />
            </span>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                پروڈکٹس مینیجر اور اسٹاک (Product Management)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                کل {products.length} پروڈکٹس رجسٹرڈ ہیں • نیا سامان شامل کریں، قیمت اور اسٹاک تبدیل کریں
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
          <Button
            variant="secondary"
            size="md"
            icon="billing"
            onClick={() => navigate('/billing')}
            className="text-xs sm:text-sm font-extrabold"
          >
            بل کاؤنٹر (POS Billing)
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon="history"
            onClick={() => navigate('/sales')}
            className="text-xs sm:text-sm font-extrabold"
          >
            سیلز ہسٹری (Sales)
          </Button>

          <Button
            variant="primary"
            size="md"
            icon="plus"
            onClick={() => {
              setEditingProduct(null);
              setIsFormModalOpen(true);
            }}
            className="text-xs sm:text-sm font-extrabold"
          >
            نیا پروڈکٹ (+ Add)
          </Button>
        </div>
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

      {/* Products Content: Table or Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={products.length === 0 ? 'barcode' : 'search'}
          title={products.length === 0 ? 'اسٹور میں کوئی پروڈکٹ موجود نہیں ہے' : 'کوئی پروڈکٹ نہیں ملا'}
          description={
            products.length === 0
              ? 'آپ ایک کلک میں فیوژن کریانہ کے ڈیفالٹ پروڈکٹس لوڈ کر سکتے ہیں یا نیا پروڈکٹ شامل کر سکتے ہیں۔'
              : 'فلٹر تبدیل کریں یا اوپر سے نیا پروڈکٹ رجسٹر کریں۔'
          }
          actionLabel={
            products.length === 0
              ? 'کریانہ پروڈکٹس لوڈ کریں (Load Default Products)'
              : 'فلٹر ری سیٹ کریں'
          }
          onAction={() => {
            if (products.length === 0 && resetProducts) {
              resetProducts();
            } else {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setStockFilter('all');
            }
          }}
        />
      ) : viewMode === 'table' ? (
        <ProductTable
          products={filteredProducts}
          onAddToCart={(prod) => {
            // When clicked on products page, dispatch event and navigate to billing
            window.dispatchEvent(new CustomEvent('pos-barcode-scanned', { detail: prod }));
            navigate('/billing');
          }}
          onEdit={(prod) => {
            setEditingProduct(prod);
            setIsFormModalOpen(true);
          }}
          onDelete={(prod) => setDeletingProduct(prod)}
          onViewSales={(prod) => setSalesProduct(prod)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(prod) => {
                window.dispatchEvent(new CustomEvent('pos-barcode-scanned', { detail: prod }));
                navigate('/billing');
              }}
              onEdit={(prod) => {
                setEditingProduct(prod);
                setIsFormModalOpen(true);
              }}
              onDelete={(prod) => setDeletingProduct(prod)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={async (prodData) => {
          await saveProduct(prodData);
          setIsFormModalOpen(false);
          setEditingProduct(null);
          setFeedbackMessage(`پروڈکٹ "${prodData.name}" کامیابی سے محفوظ ہو گیا!`);
          setTimeout(() => setFeedbackMessage(null), 3000);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={async () => {
          if (deletingProduct) {
            await deleteProduct(deletingProduct.id);
            setDeletingProduct(null);
            setFeedbackMessage(`پروڈکٹ حذف کر دیا گیا۔`);
            setTimeout(() => setFeedbackMessage(null), 3000);
          }
        }}
        title="پروڈکٹ حذف کریں؟"
        description={`کیا آپ واقعی "${deletingProduct?.name}" (${deletingProduct?.sku}) کو سسٹم سے ہٹانا چاہتے ہیں؟`}
        confirmText="ہاں، ڈیلیٹ کریں"
      />

      {/* Product Sales History Modal */}
      <ProductSalesModal
        isOpen={Boolean(salesProduct)}
        onClose={() => setSalesProduct(null)}
        product={salesProduct}
        orders={orders}
        onSelectOrder={(order) => {
          setSelectedOrder(order);
        }}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onPrint={() => {
          window.print();
        }}
      />
    </div>
  );
};
