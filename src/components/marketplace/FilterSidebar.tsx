import { X } from 'lucide-react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { ETHIOPIAN_CITIES, PRODUCT_CONDITIONS, PRODUCT_CONDITION_LABELS, ProductCondition } from '@/utils/constants';
import { Category } from '@/types';

export interface ProductFilters {
  category?: string;
  city?: string;
  condition?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  [key: string]: unknown;
}

interface FilterSidebarProps {
  filters: ProductFilters;
  categories?: Category[];
  onChange: (filters: ProductFilters) => void;
  onClear: () => void;
  className?: string;
}

export default function FilterSidebar({ filters, categories, onChange, onClear, className }: FilterSidebarProps) {
  const update = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch });

  const conditionOptions = PRODUCT_CONDITIONS.map((c) => ({
    value: c,
    label: PRODUCT_CONDITION_LABELS[c as ProductCondition],
  }));
  const categoryOptions = (categories || []).map((c) => ({ value: c._id, label: c.name }));

  const hasActiveFilters =
    filters.category || filters.city || filters.condition || filters.minPrice || filters.maxPrice;

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-textPrimary">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-textSecondary hover:text-danger"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <Select
          label="Category"
          placeholder="All categories"
          options={categoryOptions}
          value={filters.category || ''}
          onChange={(e) => update({ category: e.target.value })}
        />

        <Select
          label="City"
          placeholder="All cities"
          options={[...ETHIOPIAN_CITIES]}
          value={filters.city || ''}
          onChange={(e) => update({ city: e.target.value })}
        />

        <Select
          label="Condition"
          placeholder="Any condition"
          options={conditionOptions}
          value={filters.condition || ''}
          onChange={(e) => update({ condition: e.target.value })}
        />

        <div>
          <p className="mb-1.5 block text-sm font-medium text-textPrimary">Price range (ETB)</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => update({ minPrice: e.target.value })}
            />
            <span className="text-textSecondary">–</span>
            <Input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => update({ maxPrice: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
