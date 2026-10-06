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
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
      {/* Search Input (Larger) */}
      <div className="w-full md:w-80">
        <Input
          name="productSearch"
          placeholder="🔍 پروڈکٹ کا نام یا بار کوڈ..."
          icon="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm sm:text-base font-bold py-2.5"
        />
      </div>

      {/* Filters & Sorters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
        {/* Category Filter */}
        <div className="w-40 sm:w-48">
          <Select
            name="categoryFilter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={PRODUCT_CATEGORIES}
            className="text-xs sm:text-sm font-bold"
          />
        </div>

        {/* Stock Status Filter */}
        <div className="w-36 sm:w-40">
          <Select
            name="stockFilter"
            value={stockFilter}
            onChange={(e) => onStockFilterChange(e.target.value)}
            options={[
              { value: 'all', label: 'تمام اسٹاک (All)' },
              { value: 'in_stock', label: 'موجود (In Stock)' },
              { value: 'low_stock', label: 'کم اسٹاک (Low)' },
              { value: 'out_of_stock', label: 'ختم (Out of Stock)' },
            ]}
            className="text-xs sm:text-sm font-bold"
          />
        </div>

        {/* Sort Options */}
        <div className="w-40 sm:w-48">
          <Select
            name="sortOption"
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value)}
            options={SORT_OPTIONS}
            className="text-xs sm:text-sm font-bold"
          />
        </div>

        {/* Grid/Table View Toggle */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="ٹیبل ویو (Table)"
          >
            <Icon name="list" size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="کارڈ ویو (Grid)"
          >
            <Icon name="grid" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
