import { useState, useEffect } from 'react';
import { StatCard } from '../features/dashboard/components/StatCard';
import { SalesChart } from '../features/dashboard/components/SalesChart';
import { RecentOrdersWidget } from '../features/dashboard/components/RecentOrdersWidget';
import { TopProductsWidget } from '../features/dashboard/components/TopProductsWidget';
import { LowStockAlertWidget } from '../features/dashboard/components/LowStockAlertWidget';
import { OrderDetailsDrawer } from '../features/orders/components/OrderDetailsDrawer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { dashboardService } from '../services/dashboard.service';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/currency';

export const DashboardPage = () => {
  const { orders, products } = useStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let isMounted = true;
    dashboardService.getDashboardData().then((res) => {
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [orders, products]);

  if (isLoading || !data) {
    return <LoadingSpinner message="Calculating POS analytics & sales KPIs..." />;
  }

  const { stats, salesTrend, topProducts, recentOrders, lowStockItems } = data;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Executive POS Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time store performance, revenue metrics, and inventory alerts
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={formatCurrency(stats.totalSales)}
          subtitle={`${stats.totalOrders} total completed orders`}
          icon="trend-up"
          theme="indigo"
          trend="+12.5%"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.todaySales)}
          subtitle={`${stats.todayOrdersCount} orders placed today`}
          icon="cash"
          theme="emerald"
        />
        <StatCard
          title="Avg. Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          subtitle="Revenue per transaction"
          icon="card"
          theme="sky"
        />
        <StatCard
          title="Catalog Inventory"
          value={`${stats.totalProducts} items`}
          subtitle={`${stats.lowStockCount} low • ${stats.outOfStockCount} out of stock`}
          icon="products"
          theme={stats.outOfStockCount > 0 ? 'rose' : stats.lowStockCount > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Analytics Chart & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesTrend} />
        </div>
        <div>
          <TopProductsWidget products={topProducts} />
        </div>
      </div>

      {/* Recent Orders & Stock Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersWidget
            orders={recentOrders}
            onViewOrder={(order) => setSelectedOrder(order)}
          />
        </div>
        <div>
          <LowStockAlertWidget items={lowStockItems} />
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailsDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};
