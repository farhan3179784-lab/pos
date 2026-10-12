'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '../ui/Icon';
import { formatDate, formatTime } from '../../utils/date';

export const AdminLayout = ({ children }) => {
  const [currentDateTime, setCurrentDateTime] = useState(null);
  const pathname = usePathname() || '/billing';

  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => setCurrentDateTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleTriggerScanner = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-pos-scanner'));
    }
  };

  const isBillingActive = pathname === '/billing' || pathname === '/';
  const isSalesActive = pathname.startsWith('/sales') || pathname.startsWith('/orders') || pathname.startsWith('/history');
  const isKhataActive = pathname.startsWith('/khata') || pathname.startsWith('/customers') || pathname.startsWith('/ledger');
  const isProductsActive = pathname.startsWith('/products');

  return (
    <div suppressHydrationWarning className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans overflow-x-hidden">
      {/* TOP RESPONSIVE POS NAVIGATION BAR */}
      <header suppressHydrationWarning className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs px-2.5 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 sm:gap-3">
          {/* Top Row on Mobile / Left on Desktop: Brand & Quick Scanner */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            {/* Brand Logo & Details */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-sm shadow-indigo-200 shrink-0">
                F
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    FUSION KIRYANA
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold font-urdu text-indigo-700 truncate">
                    فیوژن کریانہ
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-semibold text-slate-700">آن لائن کاؤنٹر</span>
                  <span className="hidden md:inline text-slate-300">•</span>
                  <span className="hidden md:inline text-slate-500 font-urdu text-[11px]">رجانہ روڈ کھدروالا</span>
                  <span className="hidden sm:inline">•</span>
                  <span suppressHydrationWarning className="hidden sm:inline font-mono">
                    {currentDateTime ? formatTime(currentDateTime) : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-Only Camera Scanner Button */}
            <button
              type="button"
              onClick={handleTriggerScanner}
              className="lg:hidden flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
              title="بار کوڈ کیمرہ اسکینر (Ctrl+B)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Icon name="barcode" size={14} />
              <span>اسکینر</span>
            </button>
          </div>

          {/* Navigation Tabs (Smooth Scroll on Mobile, Centered on Tablet/Desktop) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar w-full lg:w-auto shrink-0">
            <Link
              href="/billing"
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 whitespace-nowrap ${
                isBillingActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Icon name="billing" size={16} />
              <span className="sm:hidden">بل کاؤنٹر</span>
              <span className="hidden sm:inline">بل کاؤنٹر (POS Billing)</span>
            </Link>

            <Link
              href="/sales"
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 whitespace-nowrap ${
                isSalesActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Icon name="history" size={16} />
              <span className="sm:hidden">سیلز ہسٹری</span>
              <span className="hidden sm:inline">سیلز ہسٹری (Sales History)</span>
            </Link>

            <Link
              href="/khata"
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 whitespace-nowrap ${
                isKhataActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Icon name="khata" size={16} />
              <span className="sm:hidden">گاہک کھاتہ</span>
              <span className="hidden sm:inline">گاہک کھاتہ (Khata Ledger)</span>
            </Link>

            <Link
              href="/products"
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 whitespace-nowrap ${
                isProductsActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Icon name="products" size={16} />
              <span className="sm:hidden">پروڈکٹس</span>
              <span className="hidden sm:inline">پروڈکٹس مینیجر (Products)</span>
            </Link>
          </nav>

          {/* Desktop-Only Camera Scanner Trigger Button */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
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
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
