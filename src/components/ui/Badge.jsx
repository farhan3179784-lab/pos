
const BADGE_VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  info: 'bg-sky-50 text-sky-700 border-sky-200/80',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
};

const DOT_COLORS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
  primary: 'bg-indigo-500',
};

export const Badge = ({
  children,
  variant = 'neutral',
  dot = false,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[variant] || DOT_COLORS.neutral}`}
        />
      )}
      {children}
    </span>
  );
};
