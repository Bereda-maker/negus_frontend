'use client';

import { cn } from '@/utils/cn';
import { getInitials } from '../../utils/formatter';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className,
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          'rounded-full object-cover ring-1 ring-border',
          SIZES[size],
          className
        )}
      />
    );
  }

  // Fallback: show initials with a safe fallback
  const initials = getInitials(name) || '?';

  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-border',
        SIZES[size],
        className
      )}
      aria-label={name || 'Avatar'}
    >
      {initials}
    </span>
  );
}