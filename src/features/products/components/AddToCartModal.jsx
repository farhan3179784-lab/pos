import { useState, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { formatCurrency } from '../../../utils/currency';
import {
  STANDARD_UNITS,
  isWeightBasedUnit,
  formatUnitQuantity,
  getUnitRateLabel,
} from '../../../constants/units';

const AddToCartContent = ({ product, onConfirm, onClose }) => {
  const unitKey = product.unit || 'pcs';
  const unitConfig = STANDARD_UNITS[unitKey] || STANDARD_UNITS.pcs;
  const isWeight = isWeightBasedUnit(unitKey);
  const isKg = unitKey === 'kg';
  const availableStock = Number(product.stock) || 0;
  const unitPrice = Number(product.price) || 0;

  // Tabs: 'weight' (default for weight items) | 'budget' (rupee amount) | 'count'
  const [activeTab, setActiveTab] = useState(isWeight ? 'weight' : 'count');

  // Input States
  // In KG mode, inputUnit can be 'kg' or 'g'
  const [weightInputUnit, setWeightInputUnit] = useState(isKg ? 'kg' : unitKey);
  const [quantityInput, setQuantityInput] = useState('1');
  const [budgetAmountInput, setBudgetAmountInput] = useState('100');

  // Derived effective quantity in base product unit
  const effectiveQuantity = useMemo(() => {
    if (!isWeight) {
      const q = parseFloat(quantityInput);
      return isNaN(q) || q <= 0 ? 0 : q;
    }

    if (activeTab === 'weight') {
      const val = parseFloat(quantityInput);
      if (isNaN(val) || val <= 0) return 0;

      if (isKg && weightInputUnit === 'g') {
        // Grams converted to KG
        return Math.round((val / 1000) * 1000) / 1000;
      }
      return Math.round(val * 1000) / 1000;
    }

    if (activeTab === 'budget') {
      const budget = parseFloat(budgetAmountInput);
      if (isNaN(budget) || budget <= 0 || unitPrice <= 0) return 0;
      // Weight = budget / unitPrice
      return Math.round((budget / unitPrice) * 1000) / 1000;
    }

    return 1;
  }, [isWeight, activeTab, quantityInput, isKg, weightInputUnit, budgetAmountInput, unitPrice]);

  // Derived calculated total
  const calculatedTotal = useMemo(() => {
    if (activeTab === 'budget' && isWeight) {
      // In budget mode, target budget is used directly (rounded)
      const b = parseFloat(budgetAmountInput);
      return isNaN(b) || b <= 0 ? 0 : Math.round(b);
    }
    return Math.round(effectiveQuantity * unitPrice);
  }, [activeTab, isWeight, budgetAmountInput, effectiveQuantity, unitPrice]);

  const isExceedingStock = effectiveQuantity > availableStock;
  const isInvalidQuantity = effectiveQuantity <= 0;

  // Preset handlers
  const handlePresetSelect = (presetValue) => {
    if (isKg && weightInputUnit === 'g') {
      // If user is viewing in grams mode, presetValue (in kg) converts to grams
      setQuantityInput((presetValue * 1000).toString());
    } else {
      setQuantityInput(presetValue.toString());
    }
  };

  const handleStepQuantity = (delta) => {
    const current = parseFloat(quantityInput) || 0;
    let next;
    if (isKg && weightInputUnit === 'g') {
      next = Math.max(50, current + delta * 1000);
    } else {
      const step = isWeight ? 0.25 : 1;
      next = Math.max(isWeight ? 0.05 : 1, Math.round((current + delta * step) * 100) / 100);
    }
    setQuantityInput(next.toString());
  };

  const handleBudgetPreset = (amount) => {
    setBudgetAmountInput(amount.toString());
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isInvalidQuantity || isExceedingStock) return;

    onConfirm({
      product,
      quantity: effectiveQuantity,
      unitPrice,
      calculatedTotal,
      unit: unitKey,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Snapshot */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-white shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Icon name="barcode" size={22} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate">{product.name}</h4>
          {product.nameUrdu && (
            <p className="text-xs font-bold text-slate-600 font-urdu">{product.nameUrdu}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {formatCurrency(unitPrice)} {getUnitRateLabel(unitKey)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Stock: {formatUnitQuantity(availableStock, unitKey)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Selection for Weight / Variable items */}
      {isWeight ? (
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('weight')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'weight'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="scale" size={15} />
            <span>وزن (By Weight)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'budget'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="cash" size={15} />
            <span>روپے (By Budget)</span>
          </button>
        </div>
      ) : null}

      {/* TAB 1: BY WEIGHT / QUANTITY */}
      {activeTab === 'weight' && (
        <div className="space-y-3">
          {/* Input & Unit Switcher */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Enter Weight ({unitConfig.label})
              </label>
              {isKg && (
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      if (weightInputUnit === 'g') {
                        const val = parseFloat(quantityInput) || 0;
                        setQuantityInput((val / 1000).toString());
                        setWeightInputUnit('kg');
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      weightInputUnit === 'kg'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    KG (کلو)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (weightInputUnit === 'kg') {
                        const val = parseFloat(quantityInput) || 0;
                        setQuantityInput(Math.round(val * 1000).toString());
                        setWeightInputUnit('g');
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      weightInputUnit === 'g'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Gram (گرام)
                  </button>
                </div>
              )}
            </div>

            {/* Stepper Input */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepQuantity(-1)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
                title="Decrease"
              >
                <Icon name="minus" size={18} />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={weightInputUnit === 'g' ? '10' : '0.05'}
                  min={weightInputUnit === 'g' ? '10' : '0.05'}
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full text-center text-lg font-extrabold text-slate-900 bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="0"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {weightInputUnit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleStepQuantity(1)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
                title="Increase"
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          {unitConfig.presets && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Quick Weight Presets (معیاری وزن):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {unitConfig.presets.map((preset) => {
                  const isSelected =
                    Math.abs(effectiveQuantity - preset.value) < 0.001;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="leading-tight">{preset.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BY BUDGET AMOUNT (e.g. "Rs. 100 ki cheeni de do") */}
      {activeTab === 'budget' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Enter Amount in Rupees (روپے درج کریں)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rs.
              </span>
              <input
                type="number"
                step="5"
                min="5"
                value={budgetAmountInput}
                onChange={(e) => setBudgetAmountInput(e.target.value)}
                className="w-full text-center text-lg font-extrabold text-slate-900 bg-white border border-slate-200 rounded-xl py-2 px-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                placeholder="100"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Rupees Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Amount (روپے):
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[50, 100, 200, 500].map((amt) => {
                const isSelected = parseFloat(budgetAmountInput) === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleBudgetPreset(amt)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    Rs. {amt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculated weight hint */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 text-xs">
            <span className="font-bold">وزن کا حساب: </span>
            {formatCurrency(budgetAmountInput || 0)} میں کل{' '}
            <span className="font-extrabold underline">
              {formatUnitQuantity(effectiveQuantity, unitKey, true)}
            </span>{' '}
            آئے گا۔
          </div>
        </div>
      )}

      {/* TAB 3: COUNT UNITS (pcs, packs, dozen) */}
      {activeTab === 'count' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Quantity ({unitConfig.label})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepQuantity(-1)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
                title="Decrease"
              >
                <Icon name="minus" size={18} />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={unitConfig.defaultStep || 1}
                  min={unitConfig.min || 1}
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full text-center text-lg font-extrabold text-slate-900 bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="1"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {unitConfig.short}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleStepQuantity(1)}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
                title="Increase"
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
          </div>

          {unitConfig.presets && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Quick Selection:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {unitConfig.presets.map((preset) => {
                  const isSelected =
                    Math.abs(effectiveQuantity - preset.value) < 0.001;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Calculation Preview Box */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Selected Weight / Qty:</span>
          <span className="font-extrabold text-slate-900">
            {formatUnitQuantity(effectiveQuantity, unitKey)} ({formatUnitQuantity(effectiveQuantity, unitKey, true)})
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span>Rate:</span>
          <span className="font-semibold text-slate-700">
            {formatCurrency(unitPrice)} {getUnitRateLabel(unitKey)}
          </span>
        </div>
        <div className="pt-1.5 border-t border-indigo-100 flex justify-between items-baseline">
          <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
            Total Amount (کل رقم):
          </span>
          <span className="text-xl font-black text-indigo-700">
            {formatCurrency(calculatedTotal)}
          </span>
        </div>
      </div>

      {/* Stock warning */}
      {isExceedingStock && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <Icon name="warning" size={16} />
          <span>
            Stock kam hai! Sirf <strong>{formatUnitQuantity(availableStock, unitKey)}</strong> dastiyab hai.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Button variant="secondary" size="md" onClick={onClose} className="w-1/3">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon="cart"
          disabled={isInvalidQuantity || isExceedingStock}
          className="w-2/3 shadow-md shadow-indigo-100"
        >
          Add • {formatCurrency(calculatedTotal)}
        </Button>
      </div>
    </form>
  );
};

export const AddToCartModal = ({ isOpen, onClose, product, onConfirm }) => {
  if (!isOpen || !product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Cart (وزن اور مقدار منتخب کریں)"
      subtitle={`Configure standard weight or units for ${product.name}`}
      maxWidth="max-w-md"
    >
      <AddToCartContent
        key={product.id}
        product={product}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </Modal>
  );
};
