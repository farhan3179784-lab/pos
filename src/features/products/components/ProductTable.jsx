import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';
import { calculateStockStatus } from '../../../utils/posCalculations';
import { STOCK_STATUS } from '../../../constants/stockStatus';
import {
  getUnitRateLabel,
  formatUnitQuantity,
  isWeightBasedUnit,
} from '../../../constants/units';

export const ProductTable = ({
  products = [],
  onAddToCart,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Rate (قیمت)</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
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
              const isOutOfStock = Number(product.stock) <= 0;
              const isWeight = isWeightBasedUnit(product.unit);

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Thumbnail & Name */}
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
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h4>
                        {product.nameUrdu && (
                          <span className="text-xs font-bold text-slate-600 font-urdu block">
                            {product.nameUrdu}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-400 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {product.sku}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{product.category}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded uppercase">
                        {product.unit || 'pcs'}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                    {formatCurrency(product.price)}
                    <span className="text-[11px] font-normal text-slate-500 ml-1">
                      {getUnitRateLabel(product.unit)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {formatUnitQuantity(product.stock, product.unit)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <Badge variant={statusConfig.badgeVariant} size="xs" dot>
                      {statusConfig.label}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={isOutOfStock ? 'secondary' : 'primary'}
                        size="xs"
                        icon={isWeight ? 'scale' : 'cart'}
                        disabled={isOutOfStock}
                        onClick={() => onAddToCart(product)}
                      >
                        {isOutOfStock ? 'Sold Out' : isWeight ? 'Weight' : 'Add'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Icon name="delete" size={15} />
                      </button>
                    </div>
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
