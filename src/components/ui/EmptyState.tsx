import { ReactNode, ComponentType } from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-textSecondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
