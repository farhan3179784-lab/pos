import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../utils/currency';

export const SalesChart = ({ data = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxSales = Math.max(...data.map((d) => d.sales), 100);
  const totalPeriodSales = data.reduce((sum, d) => sum + d.sales, 0);

  return (
    <Card
      title="Sales Velocity (Last 7 Days)"
      subtitle={`Cumulative revenue: ${formatCurrency(totalPeriodSales)}`}
      className="h-full"
    >
      <div className="pt-2">
        {/* Chart Viewport */}
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-1">
          {data.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.sales / maxSales) * 100));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.date || idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in">
                    <div>{formatCurrency(item.sales)}</div>
                    <div className="text-[10px] text-slate-300 font-normal">{item.orders} order(s)</div>
                  </div>
                )}

                {/* Bar */}
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-indigo-700 shadow-md'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span className="text-[11px] font-medium text-slate-500 mt-2.5 truncate">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend / Metrics */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <span>Daily Sales Volume</span>
          </div>
          <span className="text-slate-400 text-[11px]">Hover bars to inspect day metrics</span>
        </div>
      </div>
    </Card>
  );
};
