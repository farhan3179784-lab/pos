import { formatCurrency } from '../../../utils/currency';

export const CartSummary = ({ totals, taxRate, discountRate, onDiscountChange }) => {
  return (
    <div className="space-y-2.5 text-sm pt-2">
      <div className="flex justify-between text-slate-600 text-xs">
        <span>Subtotal ({totals.totalItemCount} items)</span>
        <span className="font-semibold text-slate-800">{formatCurrency(totals.subtotal)}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          Discount
          <select
            value={discountRate}
            onChange={(e) => onDiscountChange && onDiscountChange(Number(e.target.value))}
            className="text-[11px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="10">10%</option>
            <option value="15">15%</option>
          </select>
        </span>
        <span className="font-semibold text-emerald-600">
          {totals.discount > 0 ? `-${formatCurrency(totals.discount)}` : '$0.00'}
        </span>
      </div>

      <div className="flex justify-between text-xs text-slate-600">
        <span>Est. Sales Tax ({taxRate}%)</span>
        <span className="font-semibold text-slate-800">{formatCurrency(totals.tax)}</span>
      </div>

      <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
        <div>
          <span className="text-sm font-bold text-slate-900">Grand Total</span>
          <p className="text-[11px] text-slate-400">Includes all taxes and discounts</p>
        </div>
        <span className="text-xl font-extrabold text-indigo-600 tracking-tight">
          {formatCurrency(totals.grandTotal)}
        </span>
      </div>
    </div>
  );
};
