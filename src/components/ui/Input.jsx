import { Icon } from './Icon';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
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
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            <Icon name={icon} size={16} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full text-sm bg-white border rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            icon ? 'pl-9' : 'pl-3'
          } ${
            error
              ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 text-rose-900'
              : 'border-slate-200 hover:border-slate-300'
          } ${inputClassName}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
          <Icon name="error" size={12} />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
