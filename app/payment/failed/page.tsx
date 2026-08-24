import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import PaymentFailedContent from './PaymentFailedContent';

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
