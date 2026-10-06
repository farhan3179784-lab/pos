
export const Card = ({
  children,
  title,
  subtitle,
  action,
  headerBorder = true,
  className = '',
  bodyClassName = 'p-5',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200 ${className}`}>
      {(title || subtitle || action) && (
        <div
          className={`px-5 py-4 flex items-center justify-between flex-wrap gap-2 ${
            headerBorder ? 'border-b border-slate-100' : ''
          }`}
        >
          <div>
            {title && <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
