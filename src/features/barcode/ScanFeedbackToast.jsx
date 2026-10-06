import { useEffect } from 'react';
import { Icon } from '../../components/ui/Icon';
import { formatCurrency } from '../../utils/currency';
import { formatUnitQuantity } from '../../constants/units';

export const ScanFeedbackToast = ({ scanEvent, onClose }) => {
  useEffect(() => {
    if (!scanEvent) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [scanEvent, onClose]);

  if (!scanEvent) return null;

  const { type, product, barcode, message } = scanEvent;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce-in max-w-sm w-full transition-all">
      {type === 'success' && product ? (
        <div className="bg-white border-2 border-emerald-500 shadow-xl rounded-2xl p-3.5 flex items-center gap-3.5 ring-4 ring-emerald-500/10">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-100 shrink-0"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                <Icon name="barcode" size={12} />
                اسکین ہوا (Scanned)
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {product.barcode || product.sku}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
              {product.name}
            </h4>
            {product.nameUrdu && (
              <p className="text-[11px] font-bold text-slate-600 font-urdu truncate leading-tight">
                {product.nameUrdu}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-emerald-700">
                {formatCurrency(product.price)}
              </span>
              <span className="text-[11px] text-slate-500">
                ({formatUnitQuantity(1, product.unit)} شامل ہو گیا)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : (
        <div className="bg-white border-2 border-rose-500 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 ring-4 ring-rose-500/10">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Icon name="warning" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-rose-700">
              بار کوڈ نہیں ملا (Unknown Barcode)
            </h4>
            <p className="text-[11px] font-mono text-slate-700 mt-0.5">
              Code: <span className="font-bold underline">{barcode}</span>
            </p>
            <p className="text-[10px] text-slate-500 font-urdu mt-0.5">
              {message || 'یہ آئٹم انوینٹری میں موجود نہیں ہے۔'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
