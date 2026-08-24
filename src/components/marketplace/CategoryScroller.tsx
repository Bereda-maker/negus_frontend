'use client';

import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { Tag } from 'lucide-react';
import { Category } from '@/types';

// Seed data stores icon names in kebab/lowercase (e.g. "smartphone"),
// but lucide-react exports PascalCase component names (Smartphone).
const toPascalCase = (str = '') =>
  str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

interface CategoryScrollerProps {
  categories: Category[] | null | undefined;
}

type IconComponent = React.ComponentType<{ className?: string }>;

export default function CategoryScroller({ categories }: CategoryScrollerProps) {
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => {
        // Falls back to a generic tag icon if the name doesn't match a
        // real lucide-react export (e.g. an admin typo).
        const Icon: IconComponent =
          (cat.icon && (Icons as unknown as Record<string, IconComponent>)[toPascalCase(cat.icon)]) || Tag;
        return (
          <button
            key={cat._id}
            type="button"
            onClick={() => router.push(`/search?category=${cat._id}`)}
            className="flex shrink-0 flex-col items-center gap-2 rounded-card border border-border bg-surface px-5 py-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="whitespace-nowrap text-xs font-medium text-textPrimary">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
