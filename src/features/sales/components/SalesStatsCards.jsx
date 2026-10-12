import { formatCurrency, formatNumber } from '../../../utils/currency';
import { Icon } from '../../../components/ui/Icon';

export const SalesStatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'آج کی کل فروخت',
      subtitle: "Today's Sales",
      value: formatCurrency(stats.todaySales),
      extra: `${stats.todayOrdersCount} بل آج بنے`,
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderAccent: 'border-emerald-200',
      icon: 'cash',
    },
    {
      title: 'کل آمدن / فروخت',
      subtitle: 'All-Time Revenue',
      value: formatCurrency(stats.totalSales),
      extra: `اوسط فی بل: ${formatCurrency(stats.avgOrderValue)}`,
      iconBg: 'bg-indigo-100 text-indigo-700',
      borderAccent: 'border-indigo-200',
      icon: 'trend-up',
    },
    {
      title: 'کل رسیدیں / بل',
      subtitle: 'Total Invoices',
      value: formatNumber(stats.totalOrders),
      extra: 'مکمل شدہ ٹرانزیکشنز',
      iconBg: 'bg-blue-100 text-blue-700',
      borderAccent: 'border-blue-200',
      icon: 'billing',
    },
    {
      title: 'فروخت شدہ آئٹمز',
      subtitle: 'Items Sold',
      value: formatNumber(stats.totalItemsSold),
      extra: 'مجموعی پروڈکٹس فروخت ہوئے',
      iconBg: 'bg-amber-100 text-amber-700',
      borderAccent: 'border-amber-200',
      icon: 'products',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border ${card.borderAccent} shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-2`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1 truncate">
              <span className="text-[11px] sm:text-sm font-black text-slate-800 truncate">
                {card.title}
              </span>
            </div>
            <div className="text-base sm:text-2xl font-black text-slate-950 mt-1 tracking-tight truncate font-mono">
              {card.value}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5 truncate">
              {card.extra}
            </div>
          </div>

          <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${card.iconBg}`}>
            <Icon name={card.icon} size={16} />
          </div>
        </div>
      ))}
    </div>
  );
};
