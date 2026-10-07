import { formatCurrency } from '../../../utils/currency';
import { formatDate, formatTime } from '../../../utils/date';
import { Icon } from '../../../components/ui/Icon';

export const SalesTable = ({ orders = [], onViewDetail, onPrintSlip }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-800 font-black text-xs sm:text-sm border-b border-slate-200 tracking-wider">
              <th className="py-4 px-4">بل نمبر (Invoice #)</th>
              <th className="py-4 px-4">تاریخ و وقت (Date & Time)</th>
              <th className="py-4 px-4">گاہک (Customer)</th>
              <th className="py-4 px-4">سامان کی تفصیل (Items Sold)</th>
              <th className="py-4 px-4">ادائیگی (Payment)</th>
              <th className="py-4 px-4 text-right">کل رقم (Total PKR)</th>
              <th className="py-4 px-4 text-right">ایکشن (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const netTotal = Math.round(
                Number(order.pricing?.grandTotal ?? order.pricing?.total ?? 0)
              );
              const itemsCount = order.items?.length || 0;
              const itemsPreview = (order.items || [])
                .map((i) => i.nameUrdu || i.name)
                .slice(0, 3)
                .join('، ');
              const hasMoreItems = itemsCount > 3;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-indigo-50/40 transition-colors group"
                >
                  {/* Bill / Invoice ID */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-black text-xs flex items-center justify-center border border-indigo-100">
                        #{order.id.slice(-4)}
                      </span>
                      <div>
                        <span className="font-mono font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {order.id}
                        </span>
                        <span className="block text-[11px] text-emerald-700 font-bold">
                          ✓ مکمل شدہ
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-4 px-4">
                    <div className="text-sm font-bold text-slate-800">
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {formatTime(order.createdAt)}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-slate-800">
                      {order.customer?.name || 'Walk-in Customer'}
                    </span>
                  </td>

                  {/* Sold items preview */}
                  <td className="py-4 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-black text-xs">
                        {itemsCount} آئٹمز
                      </span>
                      <span className="text-xs text-slate-500 truncate" title={itemsPreview}>
                        {itemsPreview} {hasMoreItems && 'وغیرہ...'}
                      </span>
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <Icon name="cash" size={14} className="text-emerald-600" />
                      <span>{order.payment?.method || 'Cash'}</span>
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="py-4 px-4 text-right">
                    <span className="text-base sm:text-lg font-black text-slate-950">
                      {formatCurrency(netTotal)}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail(order)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="بل کی مکمل تفصیل دیکھیں"
                      >
                        <span>تفصیل</span>
                        <Icon name="chevron-right" size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onPrintSlip(order)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="سلپ پرنٹ کریں"
                      >
                        <Icon name="print" size={16} />
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
