import { useState, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { OrdersTable } from '../features/orders/components/OrdersTable';
import { OrderFilters } from '../features/orders/components/OrderFilters';
import { OrderDetailsDrawer } from '../features/orders/components/OrderDetailsDrawer';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils/currency';

export const OrdersPage = () => {
  const { orders, isLoading } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Financial summary of orders
  const summary = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o?.pricing?.grandTotal || o?.pricing?.total || o?.total) || 0),
      0
    );
    const cashCount = orders.filter((o) => o?.payment?.method === 'Cash').length;
    const onlineCount = orders.filter((o) => o?.payment?.method === 'Online Payment').length;

    return { totalRevenue, totalCount: orders.length, cashCount, onlineCount };
  }, [orders]);

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          o.id.toLowerCase().includes(query) ||
          (o.customer?.name || '').toLowerCase().includes(query);
        const matchesPayment =
          paymentFilter === 'all' || o.payment?.method === paymentFilter;
        const matchesStatus =
          statusFilter === 'all' || (o.status || 'Completed') === statusFilter;
        return matchesQuery && matchesPayment && matchesStatus;
      })
      .sort((a, b) => {
        const totalA = Number(a?.pricing?.grandTotal || a?.pricing?.total) || 0;
        const totalB = Number(b?.pricing?.grandTotal || b?.pricing?.total) || 0;
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        if (sortOption === 'date_desc') return dateB - dateA;
        if (sortOption === 'date_asc') return dateA - dateB;
        if (sortOption === 'total_desc') return totalB - totalA;
        if (sortOption === 'total_asc') return totalA - totalB;
        return 0;
      });
  }, [orders, searchQuery, paymentFilter, statusFilter, sortOption]);

  if (isLoading) {
    return <LoadingSpinner message="Loading orders history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Financial Ledger Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Orders & Transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit customer checkout slips, payment receipts, and financial history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            Revenue: {formatCurrency(summary.totalRevenue)}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
            {summary.cashCount} Cash • {summary.onlineCount} Online
          </div>
        </div>
      </div>

      {/* Orders Filter Toolbar */}
      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
      />

      {/* Orders Table or Empty State */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="orders"
          title="No orders matching criteria"
          description="Adjust your search filters or clear inputs to see past sales transactions."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setPaymentFilter('all');
            setStatusFilter('all');
          }}
        />
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onViewOrder={(order) => setSelectedOrder(order)}
        />
      )}

      {/* Reusable Order Details Drawer */}
      <OrderDetailsDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};
