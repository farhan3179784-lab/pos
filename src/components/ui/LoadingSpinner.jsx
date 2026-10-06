
export const LoadingSpinner = ({ size = 'md', message = 'Loading data...', className = '' }) => {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-indigo-600 ${sizeMap[size] || sizeMap.md}`}
      />
      {message && <p className="text-xs text-slate-500 font-medium mt-3">{message}</p>}
    </div>
  );
};

export const SkeletonRow = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-slate-200/80 rounded-md w-full" />
        </td>
      ))}
    </tr>
  );
};
