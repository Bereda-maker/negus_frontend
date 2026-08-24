'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import favoriteService from '@/services/favoriteService';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import ProductGrid from '@/components/marketplace/ProductGrid';
import FilterSidebar, { ProductFilters } from '@/components/marketplace/FilterSidebar';
import Pagination from '@/components/marketplace/Pagination';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Category, Product, Pagination as PaginationType } from '@/types';
import '@/i18n';

// Helper to generate translated sort options
const getSortOptions = (t: (key: string) => string) => [
  { value: 'newest', label: t('search.sortOptions.newest') },
  { value: 'oldest', label: t('search.sortOptions.oldest') },
  { value: 'price-asc', label: t('search.sortOptions.priceAsc') },
  { value: 'price-desc', label: t('search.sortOptions.priceDesc') },
  { value: 'popular', label: t('search.sortOptions.popular') },
];

interface SearchFilters extends ProductFilters {
  q: string;
  sort: string;
  page: number;
}

export default function SearchContent() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Read filters directly from URL
  const filters: SearchFilters = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
      condition: searchParams.get('condition') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page')) || 1,
    }),
    [searchParams]
  );

  const debouncedMinPrice = useDebounce(filters.minPrice, 500);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500);

  // Load categories
  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data));
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setIsLoading(true);
    productService
      .getProducts({
        search: filters.q || undefined,
        category: filters.category || undefined,
        city: filters.city || undefined,
        condition: filters.condition || undefined,
        minPrice: debouncedMinPrice || undefined,
        maxPrice: debouncedMaxPrice || undefined,
        sort: filters.sort,
        page: filters.page,
        limit: 12,
      })
      .then((res) => {
        setProducts(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setIsLoading(false));
  }, [
    filters.q,
    filters.category,
    filters.city,
    filters.condition,
    filters.sort,
    filters.page,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  // Load favorites if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    favoriteService.getMyFavorites({ limit: 100 }).then((res) => {
      setFavoritedIds(new Set(res.data.map((f: any) => f.product?._id || f.product)));
    });
  }, [isAuthenticated]);

  // Update a single filter (key, value) – used by FilterSidebar and Sort dropdown
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === '' || value === undefined || value === null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      // Reset page when filters change
      next.delete('page');
      router.push(`${pathname}?${next.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const updateFilters = useCallback(
    (nextFilters: ProductFilters) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value === '' || value === undefined || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      next.delete('page');
      router.push(`${pathname}?${next.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Clear all filters except search query
  const clearFilters = () => {
    const next = new URLSearchParams();
    if (filters.q) next.set('q', filters.q);
    router.push(`${pathname}?${next.toString()}`);
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (product: Product) => {
    const isFav = favoritedIds.has(product._id);
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(product._id) : next.add(product._id);
      return next;
    });
    try {
      isFav ? await favoriteService.removeFavorite(product._id) : await favoriteService.addFavorite(product._id);
    } catch {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        isFav ? next.add(product._id) : next.delete(product._id);
        return next;
      });
    }
  };

  const sortOptions = getSortOptions(t);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header with title, result count, and filters */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-textPrimary">
            {filters.q
              ? t('search.title.withQuery', { query: filters.q })
              : t('search.title.browse')}
          </h1>
          {pagination && (
            <p className="mt-0.5 text-sm text-textSecondary">
              {t('search.resultCount', { count: pagination.total })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            options={sortOptions}
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="hidden sm:block"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('search.filterButton')}
          </Button>
        </div>
      </div>

      {/* Main grid: Sidebar + Product list */}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <FilterSidebar
          filters={filters}
          categories={categories}
          onChange={updateFilters}
          onClear={clearFilters}
          className="hidden lg:block"
        />

        <div>
          <ProductGrid
            products={products}
            isLoading={isLoading}
            favoritedIds={favoritedIds}
            onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
          />
          <Pagination
            pagination={pagination}
            onPageChange={(page) => updateFilter('page', String(page))}
          />
        </div>
      </div>

      {/* Mobile filter modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-textPrimary/40" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-xs overflow-y-auto bg-surface p-5">
            <div className="mb-2 flex justify-end">
              <button onClick={() => setIsFilterOpen(false)} aria-label={t('search.closeFilters')}>
                <X className="h-5 w-5 text-textSecondary" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              categories={categories}
              onChange={updateFilters}
              onClear={clearFilters}
            />
            <Button className="mt-6 w-full" onClick={() => setIsFilterOpen(false)}>
              {t('search.showResults')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}