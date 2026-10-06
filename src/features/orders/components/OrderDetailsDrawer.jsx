import { useState } from 'react';
import { Drawer } from '../../../components/ui/Drawer';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { UrduReceipt } from '../../../components/common/UrduReceipt';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import { ORDER_STATUS } from '../../../constants/orderStatus';
import { formatUnitQuantity } from '../../../constants/units';

export const OrderDetailsDrawer = ({ isOpen, onClose, order }) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'receipt'

  if (!order) return null;

  const statusConfig = ORDER_STATUS[order.status?.toUpperCase()] || ORDER_STATUS.COMPLETED;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Order Details"
      subtitle={`Order #${order.id}`}
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="primary" size="md" icon="print" onClick={handlePrint}>
            پرنٹ سلپ (Print Urdu Slip)
          </Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* View Mode Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'summary'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Digital Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receipt')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors font-urdu ${
              activeTab === 'receipt'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            پرنٹ رسید (Urdu Receipt)
          </button>
        </div>

        {activeTab === 'receipt' ? (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-center">
            <UrduReceipt order={order} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Order Status</span>
                <div className="mt-1">
                  <Badge variant={statusConfig.badgeVariant} size="xs">
                    {order.status || 'Completed'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium block">Timestamp</span>
                <span className="font-semibold text-slate-800">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>
            </div>

            {/* Customer & Payment Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-slate-100 rounded-xl bg-white">
                <span className="text-slate-400 block mb-0.5">Customer</span>
                <div className="font-bold text-slate-800">{order.customer?.name || 'Walk-in'}</div>
              </div>
              <div className="p-3 border border-slate-100 rounded-xl bg-white">
                <span className="text-slate-400 block mb-0.5">Payment</span>
                <div className="font-bold text-slate-800">{order.payment?.method} (Paid)</div>
              </div>
            </div>

            {/* Purchased Products List */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Purchased Items ({order.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white text-xs">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-800 truncate">{item.name}</h5>
                      {item.nameUrdu && (
                        <p className="text-[11px] font-urdu text-slate-500">{item.nameUrdu}</p>
                      )}
                      <span className="text-slate-500 text-[11px]">
                        {formatCurrency(item.price)} &times; {formatUnitQuantity(item.quantity, item.unit || 'pcs')}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatCurrency(item.subtotal || item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-sm font-extrabold text-slate-900">
                <span>Net Total:</span>
                <span className="text-indigo-600">
                  {formatCurrency(order.pricing?.grandTotal || order.pricing?.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hidden thermal receipt container for printing even when in summary tab */}
        {activeTab !== 'receipt' && (
          <div className="hidden print:block">
            <UrduReceipt order={order} />
          </div>
        )}
      </div>
    </Drawer>
  );
};
