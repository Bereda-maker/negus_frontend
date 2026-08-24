import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import SocialLoginContent from './SocialLoginContent';

export default function SocialLoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SocialLoginContent />
    </Suspense>
  );
}
