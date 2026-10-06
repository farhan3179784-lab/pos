import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../utils/currency';

export const TopProductsWidget = ({ products = [] }) => {
  return (
    <Card
      title="Top Selling Products"
      subtitle="Highest velocity inventory items"
      bodyClassName="p-4"
    >
      {products.length === 0 ? (
        <EmptyState
          icon="products"
          title="No sales recorded"
          description="Complete checkouts to calculate top performing items."
        />
      ) : (
        <div className="space-y-3">
          {products.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="w-5 text-center text-xs font-bold text-slate-400">
                #{index + 1}
              </span>

              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 object-cover rounded-lg border border-slate-100 bg-slate-100 shrink-0"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                }}
              />

              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-semibold text-slate-800 truncate">{item.name}</h5>
                <span className="text-[11px] text-slate-400">{item.category}</span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-800 block">
                  {item.totalQtySold} sold
                </span>
                <span className="text-[11px] font-medium text-emerald-600">
                  {formatCurrency(item.totalRevenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
