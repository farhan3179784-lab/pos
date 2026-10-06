import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { calculateStockStatus } from '../../../utils/posCalculations';
import { STOCK_STATUS } from '../../../constants/stockStatus';
import { formatUnitQuantity } from '../../../constants/units';

export const InventoryTable = ({ products = [], onAdjustStock }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">Item Details</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Current Stock</th>
              <th className="py-3.5 px-4">Low Threshold</th>
              <th className="py-3.5 px-4">Stock Status</th>
              <th className="py-3.5 px-4 text-right">Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const statusKey = calculateStockStatus(product.stock, product.threshold);
              const statusConfig =
                statusKey === 'out_of_stock'
                  ? STOCK_STATUS.OUT_OF_STOCK
                  : statusKey === 'low_stock'
                  ? STOCK_STATUS.LOW_STOCK
                  : STOCK_STATUS.IN_STOCK;

              return (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-xl border border-slate-100 bg-slate-100 shrink-0"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{product.name}</h4>
                        <span className="text-[11px] text-slate-400">{product.category}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500">{product.sku}</td>

                  <td className="py-3 px-4 text-slate-700 font-medium">{product.category}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-sm font-extrabold ${
                        Number(product.stock) <= 0
                          ? 'text-rose-600'
                          : Number(product.stock) <= Number(product.threshold)
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {formatUnitQuantity(product.stock, product.unit)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {formatUnitQuantity(product.threshold || 10, product.unit)}
                  </td>

                  <td className="py-3 px-4">
                    <Badge variant={statusConfig.badgeVariant} size="xs" dot>
                      {statusConfig.label}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onAdjustStock(product)}
                      className="hover:border-indigo-400 hover:text-indigo-600"
                    >
                      Adjust Stock
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
