import { ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TrustBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Compact "Verified Seller" badge. Only renders when the seller has
 * crossed the trust threshold (User.isVerifiedSeller, set server-side
 * in User.recalculateStats) — deliberately not a raw score display here,
 * that lives on the full Seller Profile.
 */
export default function TrustBadge({ isVerified, size = 'sm', className }: TrustBadgeProps) {
  if (!isVerified) return null;

  const sizes: Record<'sm' | 'md', string> = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill bg-primary/10 font-medium text-primary',
        sizes[size],
        className
      )}
      title="Verified seller — trust score of 60+"
    >
      <ShieldCheck className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      Verified
    </span>
  );
}
