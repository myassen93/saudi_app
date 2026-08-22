import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/translation.json'
import ar from './locales/ar/translation.json'
import otpEn from './locales/en/otp.json'
import otpAr from './locales/ar/otp.json'

export const RTL_LANGUAGES = ['ar']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en, otp: otpEn },
      ar: { translation: ar, otp: otpAr },
    },
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

function applyDirection(lng: string) {
  const dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
  document.documentElement.dir = dir
}

applyDirection(i18n.resolvedLanguage ?? i18n.language)
i18n.on('languageChanged', applyDirection)

export default i18n
