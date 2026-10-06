export const ORDER_STATUS = {
  COMPLETED: {
    key: 'Completed',
    label: 'Completed',
    badgeVariant: 'success',
    colorClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PENDING: {
    key: 'Pending',
    label: 'Pending',
    badgeVariant: 'warning',
    colorClasses: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  CANCELLED: {
    key: 'Cancelled',
    label: 'Cancelled',
    badgeVariant: 'danger',
    colorClasses: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  REFUNDED: {
    key: 'Refunded',
    label: 'Refunded',
    badgeVariant: 'neutral',
    colorClasses: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export const PAYMENT_METHODS = {
  CASH: {
    key: 'Cash',
    label: 'Cash',
    icon: 'cash',
    description: 'Pay with physical currency',
  },
  ONLINE: {
    key: 'Online Payment',
    label: 'Online Payment',
    icon: 'card',
    description: 'Card, Digital Wallet, or QR Terminal',
  },
};

export const PAYMENT_STATUS = {
  PAID: { key: 'Paid', label: 'Paid', badgeVariant: 'success' },
  PENDING: { key: 'Pending', label: 'Pending', badgeVariant: 'warning' },
  FAILED: { key: 'Failed', label: 'Failed', badgeVariant: 'danger' },
};
