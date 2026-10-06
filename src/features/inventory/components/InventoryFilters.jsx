import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PRODUCT_CATEGORIES } from '../../../constants/categories';

export const InventoryFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  onOpenHistory,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="w-full md:w-80">
        <Input
          name="inventorySearch"
          placeholder="Search by product name or SKU..."
          icon="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Category & Status Filter */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
        <div className="w-40 sm:w-48">
          <Select
            name="inventoryCategory"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={PRODUCT_CATEGORIES}
          />
        </div>

        <div className="w-36 sm:w-40">
          <Select
            name="inventoryStatus"
            value={stockFilter}
            onChange={(e) => onStockFilterChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'in_stock', label: 'In Stock' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
            ]}
          />
        </div>

        <Button
          variant="outline"
          size="md"
          icon="history"
          onClick={onOpenHistory}
        >
          Audit History
        </Button>
      </div>
    </div>
  );
};
