// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../public/locales/en/translation.json';
import am from '../public/locales/am/translation.json';
import om from '../public/locales/om/translation.json';
import sid from '../public/locales/sid/translation.json';
import wal from '../public/locales/wal/translation.json';
import ti from '../public/locales/ti/translation.json';

const resources = {
  en: { translation: en },
  am: { translation: am },
  om: { translation: om },
  sid: { translation: sid },
  wal: { translation: wal },
  ti: { translation: ti },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // ✅ Always start with English – this ensures server and client match.
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;