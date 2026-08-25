'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '@/i18n';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-4xl font-playfair font-bold text-primary text-center mb-8">
          {t('contact.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column – Map & Quick Actions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Google Maps Embed (replace src with your actual location) */}
            <div className="bg-white rounded-2xl shadow-card border border-border p-4 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509467!2d38.7461!3d9.0200!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b859f8e6f0b0b%3A0x8f8e5b7a8f6f0b0b!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1700000000000"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Negus Gebeya Location"
              />
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <a
                href="https://wa.me/251900000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-green-600 transition shadow-md"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
              <a
                href="https://t.me/negusgebeya"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-sky-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-sky-600 transition shadow-md"
              >
                <Send className="h-5 w-5" /> Telegram
              </a>
              <a
                href="tel:+251900000000"
                className="flex items-center justify-center gap-2 bg-primary text-white font-medium py-3 px-4 rounded-xl hover:bg-primary-light transition shadow-md"
              >
                <Phone className="h-5 w-5" /> Call Us
              </a>
              <a
                href="mailto:support@negusgebeya.com"
                className="flex items-center justify-center gap-2 bg-gold text-white font-medium py-3 px-4 rounded-xl hover:bg-gold-dark transition shadow-md"
              >
                <Mail className="h-5 w-5" /> Email
              </a>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-card border border-border p-6">
              <h3 className="text-lg font-bold text-primary mb-3 text-center">
                {t('contact.social.title') || 'Follow Us'}
              </h3>
              <div className="flex justify-center gap-4">
                {[
                  { icon: Instagram, href: 'https://instagram.com/negusgebeya', label: 'Instagram' },
                  { icon: Facebook, href: 'https://facebook.com/negusgebeya', label: 'Facebook' },
                  { icon: Twitter, href: 'https://twitter.com/negusgebeya', label: 'Twitter' },
                  { icon: Youtube, href: 'https://youtube.com/negusgebeya', label: 'YouTube' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-warm-bg text-textSecondary hover:bg-gold hover:text-white transition"
                    aria-label={social.label}
                  >
                    <social.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column – Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-border p-6">
              <h2 className="text-xl font-bold text-primary mb-4">{t('contact.info.title')}</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">{t('contact.info.emailLabel')}</p>
                    <a
                      href="mailto:support@negusgebeya.com"
                      className="text-textSecondary hover:text-gold transition"
                    >
                      support@negusgebeya.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">{t('contact.info.phoneLabel')}</p>
                    <a
                      href="tel:+251900000000"
                      className="text-textSecondary hover:text-gold transition"
                    >
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

            {/* Additional CTA */}
            <div className="bg-gold/10 border border-gold/20 rounded-2xl p-6 text-center">
              <h3 className="font-bold text-primary text-lg">Need help instantly?</h3>
              <p className="text-textSecondary text-sm mt-1">
                Our support team is ready to assist you.
              </p>
              <Link
                href="/faq"
                className="inline-block mt-3 bg-gold text-white font-bold px-6 py-2 rounded-full hover:bg-gold-dark transition"
              >
                Visit FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
