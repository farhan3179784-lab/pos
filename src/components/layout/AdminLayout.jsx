import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { formatDate, formatTime } from '../../utils/date';

export const AdminLayout = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleTriggerScanner = () => {
    window.dispatchEvent(new CustomEvent('open-pos-scanner'));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans">
      {/* TOP CLEAN POS NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs px-3 sm:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-indigo-200 shrink-0">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 tracking-tight">
                  SUPER STORE POS
                </span>
                <span className="text-sm font-bold font-urdu text-indigo-700">
                  سپر اسٹور
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700">آن لائن کاؤنٹر</span>
                <span>•</span>
                <span>{formatDate(currentDateTime)}</span>
                <span className="font-mono text-slate-400">({formatTime(currentDateTime)})</span>
              </div>
            </div>
          </div>

          {/* Center: Main Navigation Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <NavLink
              to="/billing"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  isActive || location.pathname === '/'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`
              }
            >
              <Icon name="billing" size={18} />
              <span>بل کاؤنٹر (POS Billing)</span>
            </NavLink>

            <NavLink
              to="/sales"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`
              }
            >
              <Icon name="history" size={18} />
              <span>سیلز ہسٹری (Sales History)</span>
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`
              }
            >
              <Icon name="products" size={18} />
              <span>پروڈکٹس مینیجر (Products)</span>
            </NavLink>
          </nav>

          {/* Right: Camera Scanner Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerScanner}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border border-slate-800 cursor-pointer"
              title="بار کوڈ کیمرہ اسکینر (Ctrl+B)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Icon name="barcode" size={16} />
              <span>کیمرہ اسکینر (Scanner)</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
};
