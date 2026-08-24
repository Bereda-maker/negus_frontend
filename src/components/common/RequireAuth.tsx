'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from './PageLoader';

const PUBLIC_PATHS = ['/', '/product', '/search', '/seller', '/blog', '/reels', '/payment'];

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router, isPublic]);

  if (isLoading || (!isAuthenticated && !isPublic)) return <PageLoader />;
  return <>{children}</>;
}