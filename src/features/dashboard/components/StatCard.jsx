import { Icon } from '../../../components/ui/Icon';

const THEMES = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    border: 'border-sky-100',
  },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  theme = 'indigo',
  trend,
  className = '',
}) => {
  const currentTheme = THEMES[theme] || THEMES.indigo;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        <div
          className={`h-10 w-10 rounded-xl ${currentTheme.bg} ${currentTheme.text} flex items-center justify-center shrink-0`}
        >
          <Icon name={icon} size={20} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center justify-between gap-2 mt-1">
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          {trend && (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
              <Icon name="trend-up" size={10} />
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
