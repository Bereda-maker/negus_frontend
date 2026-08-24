import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SelectOption = string | { value: string; label: string };

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
}

/**
 * `options` accepts either an array of strings, or an array of
 * { value, label } objects — covers both simple enums (cities) and
 * ID-backed lists (categories) without two separate components.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options = [], placeholder = 'Select…', className, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-textPrimary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'input-field appearance-none pr-10',
              error && 'border-danger focus:border-danger',
              className
            )}
            aria-invalid={Boolean(error)}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={value} value={value}>
                  {optLabel}
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-sm text-textSecondary">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
