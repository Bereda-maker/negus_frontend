'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import '@/i18n';

export default function SocialLoginContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name') || t('socialLogin.defaultName');

    if (token) {
      loginWithToken(token);
      toast.success(t('socialLogin.toasts.welcome', { name }));
      router.replace('/');
    } else {
      toast.error(t('socialLogin.toasts.error'));
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent mx-auto"></div>
        <p className="mt-4 text-textSecondary">{t('socialLogin.loading')}</p>
      </div>
    </div>
  );
}