import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PAYMENT_METHODS } from '../../../constants/orderStatus';

export const OrderFilters = ({
  searchQuery,
  onSearchChange,
  paymentFilter,
  onPaymentFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortOption,
  onSortOptionChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="w-full md:w-80">
        <Input
          name="orderSearch"
          placeholder="Search Order ID or customer..."
          icon="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
        <div className="w-38 sm:w-44">
          <Select
            name="paymentFilter"
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Payment' },
              { value: PAYMENT_METHODS.CASH.key, label: 'Cash Only' },
              { value: PAYMENT_METHODS.ONLINE.key, label: 'Online Only' },
            ]}
          />
        </div>

        <div className="w-36 sm:w-40">
          <Select
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <div className="w-38 sm:w-44">
          <Select
            name="orderSort"
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value)}
            options={[
              { value: 'date_desc', label: 'Newest First' },
              { value: 'date_asc', label: 'Oldest First' },
              { value: 'total_desc', label: 'Highest Amount' },
              { value: 'total_asc', label: 'Lowest Amount' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
