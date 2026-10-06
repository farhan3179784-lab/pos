export const STOCK_STATUS = {
  IN_STOCK: {
    key: 'in_stock',
    label: 'In Stock',
    badgeVariant: 'success',
    colorClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  LOW_STOCK: {
    key: 'low_stock',
    label: 'Low Stock',
    badgeVariant: 'warning',
    colorClasses: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  OUT_OF_STOCK: {
    key: 'out_of_stock',
    label: 'Out of Stock',
    badgeVariant: 'danger',
    colorClasses: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
};

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
