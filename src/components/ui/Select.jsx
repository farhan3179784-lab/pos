import { Icon } from './Icon';

export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  className = '',
  selectClassName = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full text-sm bg-white border rounded-xl py-2 pl-3 pr-8 text-slate-800 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 text-rose-900'
              : 'border-slate-200 hover:border-slate-300'
          } ${selectClassName}`}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
          <Icon name="chevron-down" size={14} />
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
