'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function PaymentSuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');

  useEffect(() => {
    if (txRef) toast.success(t('paymentSuccess.toasts.success'));
  }, [txRef, t]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-card border border-border">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-primary">{t('paymentSuccess.title')}</h1>
        <p className="text-textSecondary mt-2">{t('paymentSuccess.description')}</p>
        {txRef && (
          <p className="text-sm text-textSecondary mt-1">
            {t('paymentSuccess.referenceLabel')}: <span className="font-mono">{txRef}</span>
          </p>
        )}
        <Link
          href="/orders"
          className="inline-block mt-6 bg-gold text-white px-6 py-2 rounded-full font-bold hover:bg-gold-dark transition"
        >
          {t('paymentSuccess.viewOrders')}
        </Link>
      </div>
    </div>
  );
}