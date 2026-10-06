import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';
import {
  formatUnitQuantity,
  getUnitRateLabel,
  isWeightBasedUnit,
} from '../../../constants/units';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const unit = item.unit || 'pcs';
  const isWeight = isWeightBasedUnit(unit);
  const step = isWeight ? 0.25 : 1;

  const handleDecrease = () => {
    const next = Math.max(0, Math.round((item.quantity - step) * 1000) / 1000);
    onUpdateQuantity(item.id, next);
  };

  const handleIncrease = () => {
    const next = Math.round((item.quantity + step) * 1000) / 1000;
    onUpdateQuantity(item.id, next);
  };

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
        <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
        {item.nameUrdu && (
          <p className="text-xs font-bold text-slate-500 font-urdu">{item.nameUrdu}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">
            {formatCurrency(item.price)} {getUnitRateLabel(unit)}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-extrabold text-indigo-700">
            {formatCurrency(item.subtotal)}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2.5 mt-2">
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50 p-0.5">
            <button
              type="button"
              onClick={handleDecrease}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
              title={`Decrease (${step})`}
            >
              <Icon name="minus" size={12} />
            </button>
            <span className="min-w-16 px-1.5 text-center text-xs font-bold text-slate-800 font-mono">
              {formatUnitQuantity(item.quantity, unit)}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={item.quantity >= item.maxStock}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={`Increase (${step})`}
            >
              <Icon name="plus" size={12} />
            </button>
          </div>

          {item.quantity >= item.maxStock && (
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
              Max stock
            </span>
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
