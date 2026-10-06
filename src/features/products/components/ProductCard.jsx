import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';
import { calculateStockStatus } from '../../../utils/posCalculations';
import { STOCK_STATUS } from '../../../constants/stockStatus';

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

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all group">
      <div>
        {/* Thumbnail & Quick badges */}
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute top-2.5 left-2.5">
            <Badge variant={statusConfig.badgeVariant} size="xs" dot>
              {statusConfig.label} ({product.stock})
            </Badge>
          </div>

          {/* Quick Edit/Delete Overlays */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs rounded-lg p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Edit product"
            >
              <Icon name="edit" size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Delete product"
            >
              <Icon name="delete" size={14} />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
            {product.category}
          </span>
          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h4>
          {product.nameUrdu && (
            <p className="text-xs font-bold text-slate-600 font-urdu mt-0.5">{product.nameUrdu}</p>
          )}
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{product.sku}</p>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-slate-900">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs text-slate-500">
              {product.stock} in stock
            </span>
          </div>
        </div>
      </div>

      {/* Footer Add To Cart */}
      <div className="p-4 pt-0">
        <Button
          variant={isOutOfStock ? 'secondary' : 'primary'}
          size="sm"
          icon="cart"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
          className="w-full"
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};
