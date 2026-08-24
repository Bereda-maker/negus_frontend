import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import BlogContent from './BlogContent';

export default function BlogPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BlogContent />
    </Suspense>
  );
}
