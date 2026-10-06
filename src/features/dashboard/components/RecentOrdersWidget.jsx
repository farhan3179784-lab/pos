import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../utils/currency';
import { formatTime } from '../../../utils/date';

export const RecentOrdersWidget = ({ orders = [], onViewOrder }) => {
  return (
    <Card
      title="Recent Orders"
      subtitle="Latest customer transactions"
      action={
        <Link
          to="/orders"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          View all orders &rarr;
        </Link>
      }
      bodyClassName="p-0"
    >
      {orders.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon="orders"
            title="No orders yet"
            description="Completed transactions will appear here in real time."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onViewOrder && onViewOrder(order)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-bold text-slate-800 group-hover:text-indigo-600">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {order.customer?.name || 'Walk-in'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {order.items?.length || 0} item(s)
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(order.pricing?.grandTotal || order.pricing?.total)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={order.payment?.method === 'Cash' ? 'neutral' : 'primary'}
                      size="xs"
                    >
                      {order.payment?.method}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {formatTime(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
