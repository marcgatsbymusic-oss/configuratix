import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';
import caTranslation from './locales/ca.json';
import ptTranslation from './locales/pt.json';
import euTranslation from './locales/eu.json';
import itTranslation from './locales/it.json';
import roTranslation from './locales/ro.json';
import ruTranslation from './locales/ru.json';
import ukTranslation from './locales/uk.json';
import arTranslation from './locales/ar.json';
import plTranslation from './locales/pl.json';
import nlTranslation from './locales/nl.json';
import svTranslation from './locales/sv.json';
import noTranslation from './locales/no.json';
import fiTranslation from './locales/fi.json';
// the translations
const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  de: { translation: deTranslation },
  fr: { translation: frTranslation },
  ca: { translation: caTranslation },
  pt: { translation: ptTranslation },
  eu: { translation: euTranslation },
  it: { translation: itTranslation },
  ro: { translation: roTranslation },
  ru: { translation: ruTranslation },
  uk: { translation: ukTranslation },
  ar: { translation: arTranslation },
  pl: { translation: plTranslation },
  nl: { translation: nlTranslation },
  sv: { translation: svTranslation },
  no: { translation: noTranslation },
  fi: { translation: fiTranslation }
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
