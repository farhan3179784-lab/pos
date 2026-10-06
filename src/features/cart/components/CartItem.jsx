import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 group">
      {/* Product Image */}
      <img
        src={item.image}
        alt={item.name}
        className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-100"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-800 truncate">{item.name}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{formatCurrency(item.price)} each</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-semibold text-indigo-600">
            {formatCurrency(item.subtotal)}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50 p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
              title="Decrease quantity"
            >
              <Icon name="minus" size={12} />
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-800">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Increase quantity"
            >
              <Icon name="plus" size={12} />
            </button>
          </div>

          {item.quantity >= item.maxStock && (
            <span className="text-[11px] text-amber-600 font-medium">Max stock</span>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
        title="Remove item"
      >
        <Icon name="delete" size={16} />
      </button>
    </div>
  );
};
