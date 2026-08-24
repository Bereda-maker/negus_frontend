import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { Product } from '@/types';

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-border/60" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-1/2 animate-pulse rounded bg-border/60" />
        <div className="h-3.5 w-full animate-pulse rounded bg-border/60" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-border/60" />
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[] | null | undefined;
  isLoading?: boolean;
  favoritedIds?: Set<string>;
  onToggleFavorite?: (product: Product) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonCount?: number;
}

export default function ProductGrid({
  products,
  isLoading,
  favoritedIds,
  onToggleFavorite,
  emptyTitle = 'No listings found',
  emptyDescription = 'Try adjusting your search or filters.',
  skeletonCount = 8,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isFavorited={favoritedIds?.has(product._id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
