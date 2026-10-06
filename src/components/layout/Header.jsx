import { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { useCart } from '../../hooks/useCart';
import { formatTime, formatDate } from '../../utils/date';

export const Header = ({ onOpenMobileMenu }) => {
  const { totals, openCart } = useCart();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & breadcrumb/terminal */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          title="Open menu"
        >
          <Icon name="menu" size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Online POS Terminal</span>
          <span className="text-slate-300">•</span>
          <span>{formatDate(currentDateTime)}</span>
          <span className="text-slate-400 font-mono">({formatTime(currentDateTime)})</span>
        </div>
      </div>

      {/* Right: Quick actions & Cart Drawer Trigger */}
      <div className="flex items-center gap-2.5">
        {/* Terminal Quick Alert Indicator */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] text-slate-600 font-medium">
          <span className="text-slate-400 mr-1.5">Tax Rate:</span> 8%
        </div>

        {/* Cart Trigger Button */}
        <button
          type="button"
          onClick={openCart}
          className="relative flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-indigo-200/60 shadow-xs cursor-pointer active:scale-95"
          title="Open POS Cart"
        >
          <Icon name="cart" size={18} />
          <span className="hidden sm:inline">Cart</span>
          {totals.totalItemCount > 0 && (
            <span className="h-5 min-w-5 px-1 bg-indigo-600 text-white rounded-full text-[11px] font-extrabold flex items-center justify-center shadow-xs">
              {totals.totalItemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
