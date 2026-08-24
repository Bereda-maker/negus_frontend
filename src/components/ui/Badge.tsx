import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';

const VARIANTS: Record<BadgeVariant, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary-dark',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-border text-textSecondary',
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
}

export default function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
