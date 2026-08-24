import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import PaymentSuccessContent from './PaymentSuccessContent';

// useSearchParams() opts a component out of static rendering unless it's
// wrapped in <Suspense> -- Next fails the build otherwise. Every page below
// that reads the query string (payment success/failed, search, social-login
// callback, login's ?from=) follows this same split: a plain page.tsx that
// wraps a small "*Content" client component in Suspense.
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
