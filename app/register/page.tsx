import { Suspense } from 'react';
import PageLoader from '@/components/common/PageLoader';
import RegisterContent from './RegisterContent';

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterContent />
    </Suspense>
  );
}
