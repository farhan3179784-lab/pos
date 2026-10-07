import { useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';
import { formatDate, formatTime } from '../../../utils/date';
import { formatUnitQuantity } from '../../../constants/units';

export const ProductSalesModal = ({
  isOpen,
  onClose,
  product,
  orders = [],
  onSelectOrder,
}) => {
  if (!product) return null;

  // Extract all sales occurrences of this product from orders
  const salesHistory = useMemo(() => {
    const list = [];
    orders.forEach((order) => {
      const matchItem = (order.items || []).find(
        (item) =>
          item.productId === product.id ||
          item.id === product.id ||
          item.name === product.name
      );

      if (matchItem) {
        list.push({
          orderId: order.id,
          createdAt: order.createdAt,
          customer: order.customer?.name || 'Walk-in Customer',
          quantity: Number(matchItem.quantity) || 0,
          unit: matchItem.unit || product.unit || 'pcs',
          price: Number(matchItem.price) || Number(product.price) || 0,
          discount: Number(matchItem.discount) || 0,
          subtotal:
            Number(matchItem.subtotal) ||
            (Number(matchItem.quantity) || 0) * (Number(matchItem.price) || 0),
          order,
        });
      }
    });

    // Sort by latest order first
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, product]);

  const totalQuantitySold = useMemo(() => {
    return salesHistory.reduce((sum, item) => sum + item.quantity, 0);
  }, [salesHistory]);

  const totalRevenue = useMemo(() => {
    return salesHistory.reduce((sum, item) => sum + item.subtotal, 0);
  }, [salesHistory]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="پروڈکٹ کی فروخت کی ہسٹری (Product Sales History)"
      subtitle={`${product.name} ${product.nameUrdu ? `(${product.nameUrdu})` : ''}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Product Details Header */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-900 text-indigo-300 flex items-center justify-center font-bold shrink-0">
              <Icon name="barcode" size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {product.name}
              </h3>
              {product.nameUrdu && (
                <p className="text-sm font-urdu font-bold text-indigo-700">
                  {product.nameUrdu}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {product.barcode || product.sku}
                </span>
                <span>•</span>
                <span>کیٹیگری: <strong>{product.category}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-semibold">موجودہ ریٹ:</div>
            <div className="text-lg font-black text-slate-900">
              {formatCurrency(product.price)}
            </div>
            <div className="text-xs text-slate-500">
              موجودہ اسٹاک: <strong className="text-slate-800">{product.stock} {product.unit || 'pcs'}</strong>
            </div>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-indigo-700 block">
              کل فروخت شدہ تعداد
            </span>
            <span className="text-lg sm:text-xl font-black text-indigo-950 mt-0.5 block">
              {formatUnitQuantity(totalQuantitySold, product.unit || 'pcs', true)}
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-700 block">
              کل آمدن (Revenue)
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-950 mt-0.5 block">
              {formatCurrency(totalRevenue)}
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-center">
            <span className="text-[11px] font-bold text-amber-700 block">
              کل بل / آرڈرز
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-950 mt-0.5 block">
              {salesHistory.length}
            </span>
          </div>
        </div>

        {/* Sales Logs Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-slate-800">
              کس کس بل میں فروخت ہوا (Sales Transactions)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              کل ریکارڈز: {salesHistory.length}
            </span>
          </div>

          {salesHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Icon name="history" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-bold text-sm">اس پروڈکٹ کی ابھی تک کوئی فروخت ریکارڈ نہیں ہوئی ہے۔</p>
              <p className="text-xs text-slate-400 mt-1">
                جب کاؤنٹر پر یہ پروڈکٹ بکے گا تو اس کی تاریخ یہاں نظر آئے گی۔
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <th className="py-2.5 px-3">بل نمبر</th>
                    <th className="py-2.5 px-3">تاریخ و وقت</th>
                    <th className="py-2.5 px-3">گاہک</th>
                    <th className="py-2.5 px-3 text-center">فروخت شدہ تعداد</th>
                    <th className="py-2.5 px-3 text-right">رقم (PKR)</th>
                    <th className="py-2.5 px-3 text-center">ایکشن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {salesHistory.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-black text-indigo-600">
                        #{entry.orderId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div>{formatDate(entry.createdAt)}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatTime(entry.createdAt)}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {entry.customer}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900 whitespace-nowrap">
                        {formatUnitQuantity(entry.quantity, entry.unit, true)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {formatCurrency(entry.subtotal)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectOrder?.(entry.order);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          بل دیکھیں
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors text-xs sm:text-sm cursor-pointer shadow-xs"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </Modal>
  );
};
