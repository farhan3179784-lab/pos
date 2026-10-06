import { NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from '../../constants/navigation';
import { useCart } from '../../hooks/useCart';

export const MobileNav = () => {
  const { totals, openCart } = useCart();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
              isActive
                ? 'text-indigo-600 bg-indigo-50/80'
                : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Icon name={item.icon} size={18} />
          <span className="mt-0.5">{item.label}</span>
        </NavLink>
      ))}

      {/* Mobile Cart Trigger */}
      <button
        type="button"
        onClick={openCart}
        className="relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-bold text-indigo-600 bg-indigo-50/60"
      >
        <div className="relative">
          <Icon name="cart" size={18} />
          {totals.totalItemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 bg-indigo-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
              {totals.totalItemCount}
            </span>
          )}
        </div>
        <span className="mt-0.5">Cart</span>
      </button>
    </nav>
  );
};
