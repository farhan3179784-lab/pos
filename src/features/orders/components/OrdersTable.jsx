import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import { ORDER_STATUS } from '../../../constants/orderStatus';

export const OrdersTable = ({ orders = [], onViewOrder }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Items</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const statusKey = order.status?.toUpperCase() || 'COMPLETED';
              const statusConfig = ORDER_STATUS[statusKey] || ORDER_STATUS.COMPLETED;

              return (
                <tr
                  key={order.id}
                  onClick={() => onViewOrder(order)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-indigo-600 font-mono">
                    {order.id}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDateTime(order.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {order.customer?.name || 'Walk-in Customer'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {order.items?.length || 0} items
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                    {formatCurrency(order.pricing?.grandTotal || order.pricing?.total)}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={order.payment?.method === 'Cash' ? 'neutral' : 'primary'}
                      size="xs"
                    >
                      {order.payment?.method}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={statusConfig.badgeVariant} size="xs" dot>
                      {order.status || 'Completed'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order);
                      }}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
