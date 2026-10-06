import { NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from '../../constants/navigation';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md shadow-indigo-200">
                S
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                    SUPER STORE
                  </h1>
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">
                    POS & Admin
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      name={item.icon}
                      size={18}
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}
                    />
                    {!isCollapsed && (
                      <div className="flex-1 truncate">
                        <div>{item.label}</div>
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div className="p-3 border-t border-slate-100">
          {/* User / Terminal Badge */}
          <div className="p-2.5 rounded-xl bg-slate-50 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Icon name="user" size={16} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">Store Manager</p>
                <p className="text-[10px] text-slate-400 truncate">Terminal #1 • Active</p>
              </div>
            )}
          </div>

          {/* Collapse Button (Desktop Only) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full mt-2 py-1.5 px-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 items-center justify-center gap-2 text-xs transition-colors"
          >
            <Icon name="chevron-right" size={14} className={isCollapsed ? '' : 'rotate-180'} />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
