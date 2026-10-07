import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { formatUnitQuantity } from '../../../constants/units';
import { Icon } from '../../../components/ui/Icon';

export const ProductSalesSummaryTable = ({
  productSales = [],
  onSelectProduct,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-800 font-black text-xs sm:text-sm border-b border-slate-200 tracking-wider">
              <th className="py-4 px-4">پروڈکٹ کا نام (Product)</th>
              <th className="py-4 px-4">کیٹیگری و کوڈ</th>
              <th className="py-4 px-4 text-center">موجودہ اسٹاک</th>
              <th className="py-4 px-4 text-center">فروخت شدہ مقدار</th>
              <th className="py-4 px-4 text-right">مجموعی فروخت (Revenue)</th>
              <th className="py-4 px-4 text-center">آخری فروخت</th>
              <th className="py-4 px-4 text-right">ایکشن (Action)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productSales.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-indigo-50/40 transition-colors group"
              >
                {/* Product Name */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-indigo-300 flex items-center justify-center font-bold shrink-0">
                      <Icon name="barcode" size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h4>
                      {item.nameUrdu && (
                        <span className="text-xs font-urdu font-bold text-slate-600 block mt-0.5">
                          {item.nameUrdu}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category & Code */}
                <td className="py-4 px-4">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                    {item.category || 'General'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {item.barcode || item.sku || '-'}
                  </span>
                </td>

                {/* Current Stock */}
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black ${
                      Number(item.stock) <= 0
                        ? 'bg-rose-100 text-rose-800'
                        : Number(item.stock) <= (item.threshold || 10)
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.stock} {item.unit || 'pcs'}
                  </span>
                </td>

                {/* Total Sold Qty */}
                <td className="py-4 px-4 text-center">
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    {formatUnitQuantity(item.totalQtySold, item.unit || 'pcs', true)}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {item.ordersCount} آرڈرز میں
                  </span>
                </td>

                {/* Total Revenue */}
                <td className="py-4 px-4 text-right">
                  <span className="text-base sm:text-lg font-black text-indigo-700">
                    {formatCurrency(item.totalRevenue)}
                  </span>
                </td>

                {/* Last sold date */}
                <td className="py-4 px-4 text-center">
                  {item.lastSoldAt ? (
                    <span className="text-xs font-semibold text-slate-600">
                      {formatDate(item.lastSoldAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>

                {/* View Details button */}
                <td className="py-4 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <Icon name="history" size={14} />
                    <span>تفصیل دیکھیں</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
