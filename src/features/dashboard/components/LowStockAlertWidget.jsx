import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';

export const LowStockAlertWidget = ({ items = [] }) => {
  return (
    <Card
      title="Stock Level Alerts"
      subtitle="Items requiring replenishment"
      action={
        <Link
          to="/inventory"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Manage Stock &rarr;
        </Link>
      }
      bodyClassName="p-4"
    >
      {items.length === 0 ? (
        <EmptyState
          icon="success"
          title="Stock healthy"
          description="All product quantities exceed low-stock thresholds."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isOutOfStock = item.stock <= 0;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-9 h-9 object-cover rounded-lg border border-slate-200/80 bg-white shrink-0"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-semibold text-slate-800 truncate">{item.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      Threshold: {item.threshold} units
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <Badge
                    variant={isOutOfStock ? 'danger' : 'warning'}
                    size="xs"
                    dot
                  >
                    {isOutOfStock ? '0 (Out)' : `${item.stock} left`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
