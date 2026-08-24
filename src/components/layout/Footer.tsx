'use client';

import Link from 'next/link';
import { FooterLink } from '../../types';
import { useTranslation } from 'react-i18next';
import '@/i18n'; // ensure i18n is initialised (optional if already done elsewhere)

const currentYear: number = new Date().getFullYear();

// --- Sub-component Props ---
interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface SocialLinkProps {
  href: string;
  icon: string;
  label: string;
}

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#050a14] text-white/50 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Grid — 2fr 1fr 1fr 1fr on large screens */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand column — spans 2 cols on mobile, 1 on desktop */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-white">
              Negus <span className="text-[#c9973b]">Gebeya</span>
            </h4>
            <p className="mt-2 text-sm font-light leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>

            {/* Social icons */}
            <div className="mt-4 flex gap-2">
              <SocialLink href="#" icon="fab fa-facebook-f" label="Facebook" />
              <SocialLink href="#" icon="fab fa-instagram" label="Instagram" />
              <SocialLink href="#" icon="fab fa-twitter" label="Twitter" />
              <SocialLink href="#" icon="fab fa-youtube" label="YouTube" />
            </div>
          </div>

          {/* Shop */}
          <FooterColumn
            title={t('footer.shop')}
            links={[
              { href: '/coffee', label: t('footer.shopLinks.coffee') },
              { href: '/spices', label: t('footer.shopLinks.spices') },
              { href: '/handicrafts', label: t('footer.shopLinks.handicrafts') },
              { href: '/honey-oils', label: t('footer.shopLinks.honeyOils') },
            ]}
          />

          {/* Company */}
          <FooterColumn
            title={t('footer.company')}
            links={[
              { href: '/about', label: t('footer.companyLinks.about') },
              { href: '/story', label: t('footer.companyLinks.story') },
              { href: '/sustainability', label: t('footer.companyLinks.sustainability') },
              { href: '/careers', label: t('footer.companyLinks.careers') },
            ]}
          />

          {/* Support */}
          <FooterColumn
            title={t('footer.support')}
            links={[
              { href: '/help', label: t('footer.supportLinks.help') },
              { href: '/shipping', label: t('footer.supportLinks.shipping') },
              { href: '/returns', label: t('footer.supportLinks.returns') },
              { href: '/contact', label: t('footer.supportLinks.contact') },
            ]}
          />
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs font-light tracking-wide text-white/20">
          {t('footer.copyright', { year: currentYear })}
        </div>
      </div>
    </footer>
  );
}

// ---------- Typed Sub-components ----------
function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h4 className="font-['Playfair_Display'] text-sm font-bold text-white">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm font-light text-white/40 transition-all duration-500 hover:text-[#e8c97a] hover:pl-1"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/5 text-white/25 transition-all duration-500 hover:border-[#c9973b] hover:text-[#e8c97a] hover:-translate-y-1 hover:bg-[#c9973b]/5"
    >
      <i className={icon} aria-hidden="true" />
    </a>
  );
}