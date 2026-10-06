import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Icon } from '../../../components/ui/Icon';
import { PAYMENT_METHODS } from '../../../constants/orderStatus';
import { formatCurrency } from '../../../utils/currency';

export const CheckoutModal = ({
  isOpen,
  onClose,
  totals,
  onConfirmCheckout,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CASH.key);
  const [tenderedAmount, setTenderedAmount] = useState(totals?.grandTotal || 0);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [isProcessing, setIsProcessing] = useState(false);

  const grandTotal = totals?.grandTotal || 0;
  const numTendered = Number(tenderedAmount) || 0;
  const changeDue = Math.max(0, numTendered - grandTotal);
  const isCashInsufficient = selectedMethod === PAYMENT_METHODS.CASH.key && numTendered < grandTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCashInsufficient) return;

    try {
      setIsProcessing(true);
      await onConfirmCheckout({
        paymentMethod: selectedMethod,
        tendered: selectedMethod === PAYMENT_METHODS.CASH.key ? numTendered : grandTotal,
        customerName,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Checkout & Payment"
      subtitle={`Order Total: ${formatCurrency(grandTotal)}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Input */}
        <Input
          label="Customer Name / Identifier"
          name="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Walk-in Customer or John Doe"
          icon="user"
        />

        {/* Payment Method Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            Select Payment Method <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(PAYMENT_METHODS).map((pm) => {
              const isSelected = selectedMethod === pm.key;
              return (
                <button
                  key={pm.key}
                  type="button"
                  onClick={() => setSelectedMethod(pm.key)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col items-start gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon name={pm.icon} size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{pm.label}</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{pm.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender Details */}
        {selectedMethod === PAYMENT_METHODS.CASH.key && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <Input
              label="Cash Tendered Amount"
              name="tendered"
              type="number"
              step="0.01"
              min={grandTotal}
              value={tenderedAmount}
              onChange={(e) => setTenderedAmount(e.target.value)}
              placeholder="0.00"
              icon="cash"
              error={isCashInsufficient ? `Minimum required: ${formatCurrency(grandTotal)}` : null}
            />

            <div className="flex gap-2">
              {[grandTotal, Math.ceil(grandTotal / 10) * 10, Math.ceil(grandTotal / 50) * 50 || 50].map((quickVal, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTenderedAmount(quickVal)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                >
                  {formatCurrency(quickVal)}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Change to return:</span>
              <span className={`text-base font-extrabold ${changeDue > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {formatCurrency(changeDue)}
              </span>
            </div>
          </div>
        )}

        {/* Online Payment Notice */}
        {selectedMethod === PAYMENT_METHODS.ONLINE.key && (
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
              <Icon name="card" size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-indigo-950">Card / Digital Payment Ready</h5>
              <p className="text-xs text-indigo-700/80 mt-0.5">
                Ready to charge {formatCurrency(grandTotal)} via terminal or QR payment.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            size="md"
            icon="check"
            isLoading={isProcessing}
            disabled={isCashInsufficient}
          >
            Confirm & Print Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
};
