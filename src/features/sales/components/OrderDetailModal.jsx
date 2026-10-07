import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';
import { formatDate, formatTime } from '../../../utils/date';
import { formatUnitQuantity } from '../../../constants/units';

export const OrderDetailModal = ({ isOpen, onClose, order, onPrint }) => {
  if (!order) return null;

  const netTotal = Math.round(Number(order.pricing?.grandTotal ?? order.pricing?.total ?? 0));
  const subtotal = Math.round(Number(order.pricing?.subtotal ?? netTotal));
  const discount = Math.round(Number(order.pricing?.discount ?? 0));
  const received = Math.round(Number(order.payment?.tendered ?? netTotal));
  const change = Math.max(0, received - netTotal);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`بل کی تفصیل (Invoice #${order.id})`}
      subtitle={`تاریخ: ${formatDate(order.createdAt)} بوقت ${formatTime(order.createdAt)}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Top Info Banner */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm shadow-indigo-200">
              #{order.id.slice(-4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-base">
                  بل نمبر: {order.id}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                  order.payment?.remaining > 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {order.payment?.remaining > 0 ? 'ادھار بل (Credit)' : 'مکمل ادا شدہ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                گاہک: <span className="font-bold text-slate-800 text-sm">{order.customer?.name || 'Walk-in Customer'}</span>
                {order.customer?.phone && (
                  <span className="font-mono text-slate-500 font-bold ml-2" dir="ltr">
                    ({order.customer.phone})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              ادائیگی: {order.payment?.method || 'Cash (نقد)'}
            </span>
          </div>
        </div>

        {/* Sold Items Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-slate-800">
              فروخت شدہ سامان کی فہرست ({order.items?.length || 0} آئٹمز)
            </span>
            <span className="text-xs font-bold text-slate-500">
              ریٹ و قیمت
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">پروڈکٹ کا نام</th>
                  <th className="py-2.5 px-3 text-center">تعداد / وزن</th>
                  <th className="py-2.5 px-3 text-right">ریٹ (PKR)</th>
                  <th className="py-2.5 px-3 text-right">رعایت</th>
                  <th className="py-2.5 px-3 text-right">کل رقم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {order.items?.map((item, idx) => {
                  const lineTotal = Math.round(Number(item.subtotal ?? (item.price * item.quantity - (item.discount || 0))));
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">
                          {item.name}
                        </div>
                        {item.nameUrdu && (
                          <div className="text-xs font-urdu font-bold text-indigo-700 mt-0.5">
                            {item.nameUrdu}
                          </div>
                        )}
                        {item.sku && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {item.sku}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                        {formatUnitQuantity(item.quantity, item.unit || 'pcs', true)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-amber-700">
                        {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary Breakdown */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-slate-600">
            <span>سب ٹوٹل (Subtotal):</span>
            <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-emerald-700">
              <span>کل رعایت (Discount):</span>
              <span className="font-bold">- {formatCurrency(discount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm sm:text-base font-black text-slate-900">
              کل بل رقم (Grand Total):
            </span>
            <span className="text-lg sm:text-xl font-black text-indigo-700">
              {formatCurrency(netTotal)}
            </span>
          </div>

          <div className="pt-2 border-t border-dashed border-slate-200 flex flex-wrap justify-between items-center text-xs text-slate-600 font-medium">
            <span>وصول شدہ رقم: <strong className="text-slate-900 font-mono text-sm">{formatCurrency(received)}</strong></span>
            {change > 0 && (
              <span>واپس بقایا رقم: <strong className="text-emerald-700 font-mono text-sm">{formatCurrency(change)}</strong></span>
            )}
          </div>

          {order.payment?.remaining > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between items-center font-bold text-rose-800">
                <span>اس بل کا بقایا (Credit Due):</span>
                <span className="font-mono text-sm font-black text-rose-700">
                  {formatCurrency(order.payment.remaining)}
                </span>
              </div>
              {order.payment?.prevBalance > 0 && (
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>سابقہ کھاتہ بقایا (Previous Balance):</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatCurrency(order.payment.prevBalance)}
                  </span>
                </div>
              )}
              {order.payment?.totalBalanceAfter > 0 && (
                <div className="flex justify-between items-center font-black text-slate-900 pt-1 border-t border-rose-200">
                  <span>کل نیا کھاتہ واجب الادا (Net Khata Balance):</span>
                  <span className="font-mono text-sm text-rose-800">
                    {formatCurrency(order.payment.totalBalanceAfter)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-xs sm:text-sm cursor-pointer"
          >
            بند کریں (Close)
          </button>

          <button
            type="button"
            onClick={() => onPrint?.(order)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-colors text-xs sm:text-sm shadow-md cursor-pointer active:scale-95"
          >
            <Icon name="print" size={18} />
            <span>رسید پرنٹ کریں (Print Receipt)</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
