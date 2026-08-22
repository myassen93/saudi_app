import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../locales/ar.json';
import en from '../locales/en.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Default to Arabic; _layout.tsx calls i18n.changeLanguage() with the
// persisted (or device) value before the first screen renders.
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
