import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Icon } from '../components/ui/Icon';
import { EmptyState } from '../components/ui/EmptyState';
import { UrduReceipt } from '../components/common/UrduReceipt';
import { SalesStatsCards } from '../features/sales/components/SalesStatsCards';
import { SalesTable } from '../features/sales/components/SalesTable';
import { ProductSalesSummaryTable } from '../features/sales/components/ProductSalesSummaryTable';
import { OrderDetailModal } from '../features/sales/components/OrderDetailModal';
import { ProductSalesModal } from '../features/sales/components/ProductSalesModal';

export const SalesHistoryPage = () => {
  const navigate = useNavigate();
  const { orders, products, isLoading } = useStore();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products'
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'week' | 'month'

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductSalesOpen, setIsProductSalesOpen] = useState(false);

  const [printedOrder, setPrintedOrder] = useState(null);

  // Overall statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => {
      return sum + (Number(o?.pricing?.grandTotal ?? o?.pricing?.total ?? o?.total) || 0);
    }, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => {
      const oDate = (o.createdAt || '').split('T')[0];
      return oDate === todayStr;
    });

    const todaySales = todayOrders.reduce((sum, o) => {
      return sum + (Number(o?.pricing?.grandTotal ?? o?.pricing?.total ?? o?.total) || 0);
    }, 0);

    const totalItemsSold = orders.reduce((sum, o) => {
      return (
        sum +
        (o.items || []).reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0)
      );
    }, 0);

    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    return {
      totalSales,
      todaySales,
      totalOrders,
      todayOrdersCount: todayOrders.length,
      totalItemsSold,
      avgOrderValue,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterdayDate = new Date();
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return orders
      .filter((order) => {
        const orderDateStr = (order.createdAt || '').split('T')[0];
        const orderDate = new Date(order.createdAt || Date.now());

        // Date filter
        if (dateFilter === 'today' && orderDateStr !== todayStr) return false;
        if (dateFilter === 'yesterday' && orderDateStr !== yesterdayStr) return false;
        if (dateFilter === 'week' && orderDate < sevenDaysAgo) return false;
        if (dateFilter === 'month' && orderDate < thirtyDaysAgo) return false;

        // Search query filter
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;

        const matchesId = (order.id || '').toLowerCase().includes(q);
        const matchesCustomer = (order.customer?.name || '').toLowerCase().includes(q);
        const matchesItem = (order.items || []).some(
          (item) =>
            (item.name || '').toLowerCase().includes(q) ||
            (item.nameUrdu || '').includes(q) ||
            (item.sku || '').toLowerCase().includes(q) ||
            (item.barcode || '').toLowerCase().includes(q)
        );

        return matchesId || matchesCustomer || matchesItem;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, dateFilter, searchQuery]);

  // Aggregated Product Sales
  const aggregatedProductSales = useMemo(() => {
    const map = {};

    // Initialize with existing products
    products.forEach((p) => {
      map[p.id] = {
        id: p.id,
        name: p.name,
        nameUrdu: p.nameUrdu,
        sku: p.sku,
        barcode: p.barcode,
        category: p.category,
        unit: p.unit || 'pcs',
        price: p.price,
        stock: p.stock,
        threshold: p.threshold,
        totalQtySold: 0,
        totalRevenue: 0,
        ordersCount: 0,
        lastSoldAt: null,
      };
    });

    // Populate from orders
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.productId || item.id;
        if (!map[key]) {
          map[key] = {
            id: key,
            name: item.name,
            nameUrdu: item.nameUrdu,
            sku: item.sku || '-',
            barcode: item.barcode || '-',
            category: item.category || 'General',
            unit: item.unit || 'pcs',
            price: item.price,
            stock: 0,
            threshold: 10,
            totalQtySold: 0,
            totalRevenue: 0,
            ordersCount: 0,
            lastSoldAt: null,
          };
        }

        const qty = Number(item.quantity) || 0;
        const subtotal =
          Number(item.subtotal) || qty * (Number(item.price) || 0);

        map[key].totalQtySold += qty;
        map[key].totalRevenue += subtotal;
        map[key].ordersCount += 1;

        if (
          !map[key].lastSoldAt ||
          new Date(order.createdAt) > new Date(map[key].lastSoldAt)
        ) {
          map[key].lastSoldAt = order.createdAt;
        }
      });
    });

    const list = Object.values(map);

    // Apply search filter
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.nameUrdu && p.nameUrdu.includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.barcode && p.barcode.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        )
      : list;

    // Sort by highest quantity sold first
    return filtered.sort((a, b) => b.totalQtySold - a.totalQtySold);
  }, [products, orders, searchQuery]);

  // Handle re-print slip
  const handlePrintSlip = (order) => {
    setPrintedOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleOpenOrderDetail = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleOpenProductSales = (product) => {
    setSelectedProduct(product);
    setIsProductSalesOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shadow-xs">
            <Icon name="history" size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              سیلز ہسٹری اور فروخت کی تفصیلات (Sales History)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              فروخت شدہ بل، اشیاء کی فہرست، آمدن کا ریکارڈ اور پرانی رسیدیں دوبارہ پرنٹ کریں
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/billing')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Icon name="billing" size={18} />
            <span>نیا بل بنائیں (POS Billing)</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* OVERVIEW KPI STATS CARDS */}
      {/* ---------------------------------------------------- */}
      <SalesStatsCards stats={stats} />

      {/* ---------------------------------------------------- */}
      {/* TABS & SEARCH / FILTER TOOLBAR */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Upper Row: Tabs Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon name="orders" size={16} />
              <span>بل وار فروخت ({filteredOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon name="products" size={16} />
              <span>پروڈکٹ وار فروخت ({aggregatedProductSales.length})</span>
            </button>
          </div>

          {/* Quick Date Pills (for orders tab) */}
          {activeTab === 'orders' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'سبھی (All)' },
                { id: 'today', label: 'آج (Today)' },
                { id: 'yesterday', label: 'گزشتہ کل (Yesterday)' },
                { id: 'week', label: 'پچھلے 7 دن' },
                { id: 'month', label: 'اس ماہ' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setDateFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    dateFilter === pill.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lower Row: Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'orders'
                ? '🔍 بل نمبر، گاہک کا نام یا بل میں شامل کسی آئٹم کا نام تلاش کریں...'
                : '🔍 پروڈکٹ کا نام، اردو نام، کیٹیگری یا بار کوڈ تلاش کریں...'
            }
            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-2 px-2 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              صاف کریں
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CONTENT LISTING TABLE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'orders' ? (
        filteredOrders.length === 0 ? (
          <EmptyState
            icon="orders"
            title="کوئی بل یا فروخت ریکارڈ نہیں ملا"
            description="منتخب کردہ تاریخ یا تلاش کے مطابق کوئی بل موجود نہیں ہے۔"
            actionLabel="فلٹر ری سیٹ کریں"
            onAction={() => {
              setSearchQuery('');
              setDateFilter('all');
            }}
          />
        ) : (
          <SalesTable
            orders={filteredOrders}
            onViewDetail={handleOpenOrderDetail}
            onPrintSlip={handlePrintSlip}
          />
        )
      ) : aggregatedProductSales.length === 0 ? (
        <EmptyState
          icon="products"
          title="کوئی پروڈکٹ نہیں ملا"
          description="تلاش کے مطابق کوئی پروڈکٹ نہیں ملا۔"
          actionLabel="تلاش صاف کریں"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <ProductSalesSummaryTable
          productSales={aggregatedProductSales}
          onSelectProduct={handleOpenProductSales}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* ORDER DETAIL MODAL */}
      {/* ---------------------------------------------------- */}
      <OrderDetailModal
        isOpen={isOrderDetailOpen}
        onClose={() => {
          setIsOrderDetailOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onPrint={(order) => {
          handlePrintSlip(order);
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* PRODUCT SALES MODAL */}
      {/* ---------------------------------------------------- */}
      <ProductSalesModal
        isOpen={isProductSalesOpen}
        onClose={() => {
          setIsProductSalesOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        orders={orders}
        onSelectOrder={(order) => {
          setIsProductSalesOpen(false);
          setSelectedProduct(null);
          handleOpenOrderDetail(order);
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* HIDDEN THERMAL RECEIPT FOR RE-PRINTING */}
      {/* ---------------------------------------------------- */}
      {printedOrder && (
        <div className="hidden print:block">
          <UrduReceipt order={printedOrder} />
        </div>
      )}
    </div>
  );
};
