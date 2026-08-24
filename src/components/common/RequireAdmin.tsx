'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from './PageLoader';

const PUBLIC_PATHS = ['/', '/product', '/search', '/seller', '/blog', '/reels', '/payment'];

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (isAuthenticated && user?.role !== 'admin') {
      toast.error("You don't have permission to view that page.");
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, user, pathname, router, isPublic]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') return <PageLoader />;
  return <>{children}</>;
}