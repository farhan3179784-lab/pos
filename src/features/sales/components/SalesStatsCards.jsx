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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-2xl p-4 sm:p-5 border ${card.borderAccent} shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-3`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-slate-800">
                {card.title}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({card.subtitle})
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-950 mt-1.5 tracking-tight">
              {card.value}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              {card.extra}
            </div>
          </div>

          <div className={`p-3 rounded-xl shrink-0 ${card.iconBg}`}>
            <Icon name={card.icon} size={22} />
          </div>
        </div>
      ))}
    </div>
  );
};
