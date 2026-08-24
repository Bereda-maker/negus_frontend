import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Pagination as PaginationType } from '@/types';

interface PaginationProps {
  pagination: PaginationType | null | undefined;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages } = pagination;
  // Some list endpoints (e.g. My Listings) don't return hasNextPage/hasPrevPage —
  // derive them from page/totalPages so this component works with either shape.
  const hasPrevPage = pagination.hasPrevPage ?? page > 1;
  const hasNextPage = pagination.hasNextPage ?? page < totalPages;

  // Compact page-number window (max 5 visible) so this doesn't overflow
  // on mobile when there are dozens of pages.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        disabled={!hasPrevPage}
        onClick={() => onPageChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-button border border-border text-textSecondary transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && <span className="px-1 text-textSecondary">…</span>}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-button text-sm font-medium transition-colors',
            p === page ? 'bg-primary text-white' : 'text-textPrimary hover:bg-border/50'
          )}
        >
          {p}
        </button>
      ))}

      {end < totalPages && <span className="px-1 text-textSecondary">…</span>}

      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-button border border-border text-textSecondary transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
