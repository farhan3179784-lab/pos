import { Icon } from './Icon';

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200 focus-visible:ring-indigo-500',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-200 focus-visible:ring-rose-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-200 focus-visible:ring-emerald-500',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
  sm: 'px-3 py-1.5 text-xs font-medium gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm font-medium gap-2 rounded-xl',
  lg: 'px-5 py-2.5 text-base font-semibold gap-2.5 rounded-xl',
};

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : icon ? (
        <Icon name={icon} size={size === 'xs' || size === 'sm' ? 14 : 18} />
      ) : null}
      
      {children && <span>{children}</span>}

      {!isLoading && iconRight && (
        <Icon name={iconRight} size={size === 'xs' || size === 'sm' ? 14 : 18} />
      )}
    </button>
  );
};
