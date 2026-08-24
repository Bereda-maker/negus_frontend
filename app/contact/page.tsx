'use client';

import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import '@/i18n';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="text-4xl font-playfair font-bold text-primary text-center mb-8">
          {t('contact.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact form */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-6">
            <h2 className="text-xl font-bold text-primary mb-4">{t('contact.form.title')}</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  {t('contact.form.nameLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('contact.form.namePlaceholder')}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  {t('contact.form.emailLabel')}
                </label>
                <input
                  type="email"
                  placeholder={t('contact.form.emailPlaceholder')}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  {t('contact.form.messageLabel')}
                </label>
                <textarea
                  rows={4}
                  placeholder={t('contact.form.messagePlaceholder')}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-xl transition"
              >
                {t('contact.form.submitButton')}
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-6">
            <h2 className="text-xl font-bold text-primary mb-4">{t('contact.info.title')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="font-medium text-primary">{t('contact.info.emailLabel')}</p>
                  <a href="mailto:support@negusgebeya.com" className="text-textSecondary hover:text-gold transition">
                    support@negusgebeya.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="font-medium text-primary">{t('contact.info.phoneLabel')}</p>
                  <a href="tel:+251900000000" className="text-textSecondary hover:text-gold transition">
                    +251 900 000 000
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="font-medium text-primary">{t('contact.info.addressLabel')}</p>
                  <p className="text-textSecondary">{t('contact.info.address')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="font-medium text-primary">{t('contact.info.hoursLabel')}</p>
                  <p className="text-textSecondary">{t('contact.info.hours')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}