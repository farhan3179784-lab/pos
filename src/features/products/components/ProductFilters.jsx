import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Icon } from '../../../components/ui/Icon';
import { PRODUCT_CATEGORIES, SORT_OPTIONS } from '../../../constants/categories';

export const ProductFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  sortOption,
  onSortOptionChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="w-full md:w-72">
        <Input
          name="productSearch"
          placeholder="Search product name or SKU..."
          icon="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters & Sorters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
        {/* Category Filter */}
        <div className="w-38 sm:w-44">
          <Select
            name="categoryFilter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={PRODUCT_CATEGORIES}
          />
        </div>

        {/* Stock Status Filter */}
        <div className="w-32 sm:w-36">
          <Select
            name="stockFilter"
            value={stockFilter}
            onChange={(e) => onStockFilterChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Stock' },
              { value: 'in_stock', label: 'In Stock' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
            ]}
          />
        </div>

        {/* Sort Options */}
        <div className="w-38 sm:w-44">
          <Select
            name="sortOption"
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        {/* Grid/Table View Toggle */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid View"
          >
            <Icon name="grid" size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Table View"
          >
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
