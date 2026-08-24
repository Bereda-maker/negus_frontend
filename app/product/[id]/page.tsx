import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import ProductDetailsContent from './ProductDetailsContent';

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductDetailsContent />
    </Suspense>
  );
}
