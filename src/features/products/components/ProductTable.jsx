import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';
import { calculateStockStatus } from '../../../utils/posCalculations';
import { STOCK_STATUS } from '../../../constants/stockStatus';
import {
  getUnitRateLabel,
  formatUnitQuantity,
} from '../../../constants/units';

export const ProductTable = ({
  products = [],
  onAddToCart,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-black text-xs sm:text-sm border-b border-slate-200 uppercase tracking-wider">
              <th className="py-4 px-4">سامان / پروڈکٹ (Product)</th>
              <th className="py-4 px-4">بار کوڈ / کوڈ</th>
              <th className="py-4 px-4">کیٹیگری</th>
              <th className="py-4 px-4 text-right">ریٹ (Rate / PKR)</th>
              <th className="py-4 px-4">موجودہ اسٹاک</th>
              <th className="py-4 px-4">اسٹاک حالت</th>
              <th className="py-4 px-4 text-right">ایکشن (Actions)</th>
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

              return (
                <tr
                  key={product.id}
                  className="hover:bg-indigo-50/40 transition-colors group"
                >
                  {/* Name & Urdu (Large, high visibility) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        <Icon name="barcode" size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.nameUrdu && (
                          <span className="text-sm sm:text-base font-bold text-slate-600 font-urdu block mt-0.5">
                            {product.nameUrdu}
                          </span>
                        )}
                        {product.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU & Barcode */}
                  <td className="py-4 px-4 font-mono">
                    <div className="text-sm font-black text-slate-800">
                      {product.barcode || product.sku}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Icon name="barcode" size={14} />
                      <span>{product.sku}</span>
                    </div>
                  </td>

                  {/* Category & Unit */}
                  <td className="py-4 px-4">
                    <div className="text-sm sm:text-base font-bold text-slate-800">
                      {product.category}
                    </div>
                    <span className="inline-block mt-0.5 text-xs font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                      یونٹ: {product.unit || 'pcs'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-right">
                    <div className="text-base sm:text-lg font-black text-slate-950">
                      {formatCurrency(product.price)}
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {getUnitRateLabel(product.unit)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-4 font-black text-slate-900 text-sm sm:text-base">
                    {formatUnitQuantity(product.stock, product.unit)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <Badge variant={statusConfig.badgeVariant} size="sm" dot>
                      <span className="font-extrabold text-xs">{statusConfig.label}</span>
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onAddToCart && (
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => onAddToCart(product)}
                          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <Icon name="plus" size={14} />
                          <span>{isOutOfStock ? 'ختم ہے' : 'بل میں ڈالیں'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        title="پروڈکٹ تبدیل کریں"
                      >
                        <Icon name="edit" size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="پروڈکٹ حذف کریں"
                      >
                        <Icon name="delete" size={18} />
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
