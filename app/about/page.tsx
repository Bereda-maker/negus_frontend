'use client';

import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="text-4xl font-playfair font-bold text-primary text-center mb-8">
          {t('about.title')}
        </h1>

        <div className="bg-white rounded-2xl shadow-card border border-border p-8 space-y-6">
          <p className="text-textSecondary leading-relaxed">
            {t('about.paragraph1')}
          </p>
          <p className="text-textSecondary leading-relaxed">
            {t('about.paragraph2')}
          </p>
          <p className="text-textSecondary leading-relaxed">
            {t('about.paragraph3')}
          </p>
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-6 text-center mt-4">
            <p className="text-primary font-semibold text-lg">{t('about.cta')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}