import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';
import caTranslation from './locales/ca.json';
import ptTranslation from './locales/pt.json';
import euTranslation from './locales/eu.json';

// the translations
const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  de: { translation: deTranslation },
  fr: { translation: frTranslation },
  ca: { translation: caTranslation },
  pt: { translation: ptTranslation },
  eu: { translation: euTranslation }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
