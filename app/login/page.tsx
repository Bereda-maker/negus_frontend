import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginContent />
    </Suspense>
  );
}
