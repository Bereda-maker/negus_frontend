'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-white/80 hover:text-white transition">
        <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span>{languages.find((l) => l.code === i18n.language)?.label || 'English'}</span>
      </button>
      <div className="absolute right-0 mt-2 w-36 rounded-lg border border-border bg-surface shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`block w-full px-4 py-2 text-sm text-left hover:bg-gold/5 transition ${
              i18n.language === lang.code ? 'text-gold font-semibold' : 'text-textPrimary'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
