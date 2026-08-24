import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SearchContent />
    </Suspense>
  );
}
