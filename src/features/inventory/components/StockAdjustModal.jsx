import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Icon } from '../../../components/ui/Icon';

const REASONS = [
  'Supplier shipment restock',
  'Inventory audit correction',
  'Customer product return',
  'Damaged or expired goods',
  'Theft or shrinkage write-off',
  'Internal store transfer',
];

export const StockAdjustModal = ({
  isOpen,
  onClose,
  product,
  onConfirmAdjust,
}) => {
  const [mode, setMode] = useState('add'); // 'add' | 'subtract'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!product) return null;

  const currentStock = Number(product.stock) || 0;
  const numQty = Number(quantity) || 0;
  const delta = mode === 'add' ? numQty : -numQty;
  const projectedStock = currentStock + delta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numQty <= 0) {
      setError('Please enter a quantity greater than zero');
      return;
    }
    if (projectedStock < 0) {
      setError(`Cannot reduce below 0. Current stock is ${currentStock}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmAdjust({
        productId: product.id,
        delta,
        reason,
      });
      setQuantity('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Inventory Stock"
      subtitle={`${product.name} (${product.sku})`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current vs Projected preview */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Current Stock</span>
            <span className="text-xl font-extrabold text-slate-800">{currentStock}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Projected Stock</span>
            <span
              className={`text-xl font-extrabold ${
                projectedStock < 0
                  ? 'text-rose-600'
                  : projectedStock <= (product.threshold || 10)
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {projectedStock}
            </span>
          </div>
        </div>

        {/* Action Type Toggle */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Action Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setMode('add'); setError(null); }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'add'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon name="plus" size={14} /> Add Stock (Restock)
            </button>
            <button
              type="button"
              onClick={() => { setMode('subtract'); setError(null); }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'subtract'
                  ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon name="minus" size={14} /> Reduce Stock (Write-off)
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <Input
          label="Adjustment Quantity"
          name="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => { setQuantity(e.target.value); setError(null); }}
          placeholder="e.g. 10"
          error={error}
          required
        />

        {/* Reason Select */}
        <Select
          label="Adjustment Reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={REASONS}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={mode === 'add' ? 'success' : 'danger'}
            size="md"
            isLoading={isSubmitting}
            disabled={projectedStock < 0 || numQty <= 0}
          >
            Confirm {mode === 'add' ? 'Restock' : 'Reduction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
