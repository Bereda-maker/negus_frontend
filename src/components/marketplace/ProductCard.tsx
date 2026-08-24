import Link from 'next/link';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCurrency, timeAgo } from '@/utils/formatter';
import { PRODUCT_CONDITION_LABELS, ProductCondition } from '@/utils/constants';
import TrustBadge from './TrustBadge';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
}

export default function ProductCard({ product, isFavorited = false, onToggleFavorite, className }: ProductCardProps) {
  const cover = product.images?.[0]?.url;

  return (
    <div className={cn('card group relative flex flex-col overflow-hidden', className)}>
      <Link href={`/product/${product._id}`} className="relative block aspect-square overflow-hidden bg-border/40">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- listing photos are arbitrary user uploads (Cloudinary), so a fixed next/image size doesn't fit every card; see Special Considerations in the migration notes.
          <img
            src={cover}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-textSecondary">No image</div>
        )}

        {product.aiAssisted && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-surface/90 px-2 py-1 text-xs font-medium text-primary shadow-card">
            <Sparkles className="h-3 w-3" />
            AI-enhanced
          </span>
        )}

        {product.status === 'sold' && (
          <span className="absolute inset-0 flex items-center justify-center bg-textPrimary/50">
            <span className="rounded-pill bg-surface px-3 py-1 text-sm font-semibold text-textPrimary">Sold</span>
          </span>
        )}
      </Link>

      {onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(product);
          }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-textSecondary shadow-card transition-colors hover:text-danger"
        >
          <Heart className={cn('h-4 w-4', isFavorited && 'fill-danger text-danger')} />
        </button>
      )}

      <Link href={`/product/${product._id}`} className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-lg font-bold text-textPrimary">{formatCurrency(product.price)}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-textPrimary">{product.title}</h3>

        <div className="mt-0.5 flex items-center gap-1 text-xs text-textSecondary">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{product.city}</span>
          <span>·</span>
          <span className="shrink-0">
            {PRODUCT_CONDITION_LABELS[product.condition as ProductCondition] || product.condition}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-textSecondary">{timeAgo(product.createdAt)}</span>
          {product.seller?.isVerifiedSeller && <TrustBadge isVerified size="sm" />}
        </div>
      </Link>
    </div>
  );
}
