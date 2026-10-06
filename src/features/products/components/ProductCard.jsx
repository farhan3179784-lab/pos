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

export const ProductCard = ({
  product,
  onAddToCart,
  onEdit,
  onDelete,
}) => {
  const stockStatusKey = calculateStockStatus(product.stock, product.threshold);
  const statusConfig =
    stockStatusKey === 'out_of_stock'
      ? STOCK_STATUS.OUT_OF_STOCK
      : stockStatusKey === 'low_stock'
      ? STOCK_STATUS.LOW_STOCK
      : STOCK_STATUS.IN_STOCK;

  const isOutOfStock = Number(product.stock) <= 0;
  const isWeight = isWeightBasedUnit(product.unit);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between p-4 relative group">
      <div>
        {/* Top Header: Category, Unit & Status Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg uppercase tracking-wider truncate">
              {product.category}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
              {product.unit || 'pcs'}
            </span>
          </div>

          <Badge variant={statusConfig.badgeVariant} size="xs" dot>
            {statusConfig.label} ({formatUnitQuantity(product.stock, product.unit)})
          </Badge>
        </div>

        {/* Product Names: English & Authentic Urdu */}
        <div className="space-y-0.5 mt-2">
          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h4>
          {product.nameUrdu && (
            <p className="text-sm font-bold text-slate-700 font-urdu leading-tight">
              {product.nameUrdu}
            </p>
          )}
        </div>

        {/* Barcode & SKU Pill */}
        <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono">
          <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
            <Icon name="barcode" size={14} />
          </div>
          <div className="min-w-0 flex-1 truncate">
            <span className="font-bold text-slate-800 text-[11px] block truncate">
              {product.barcode || product.sku}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {product.sku}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">قیمت (Rate):</span>
            <div className="text-lg font-black text-slate-950">
              {formatCurrency(product.price)}
              <span className="text-xs font-normal text-slate-500 ml-1">
                {getUnitRateLabel(product.unit)}
              </span>
            </div>
          </div>

          {/* Quick Edit/Delete Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Edit product"
            >
              <Icon name="edit" size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete product"
            >
              <Icon name="delete" size={15} />
            </button>
          </div>
        </div>

        <Button
          variant={isOutOfStock ? 'secondary' : 'primary'}
          size="md"
          icon="plus"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
          className={`w-full justify-center font-bold ${
            isOutOfStock ? '' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          }`}
        >
          {isOutOfStock ? 'اسٹاک ختم (Out of Stock)' : '+ بل میں شامل کریں (+ Add to Bill)'}
        </Button>
      </div>
    </div>
  );
};
