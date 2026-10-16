import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enError from '../i18n/en/error.json'
import enTranslation from '../i18n/en/en.json'
import viError from '../i18n/vi/error.json'
import viTranslation from '../i18n/vi/vi.json'

export const defaultNS = 'translation'
export const resources = {
  vi: {
    translation: viTranslation,
    error: viError,
  },
  en: {
    translation: enTranslation,
    error: enError,
  },
} as const

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'vi'
  const saved = window.localStorage.getItem('i18nextLng')
  return saved && saved.toLowerCase().startsWith('en') ? 'en' : 'vi'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'vi',
  defaultNS,
  ns: ['translation', 'error'],
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng: string) => {
  if (typeof window !== 'undefined') {
    const normalized = lng.toLowerCase().startsWith('en') ? 'en' : 'vi'
    window.localStorage.setItem('i18nextLng', normalized)
    document.documentElement.lang = normalized
  }
})

export default i18n
