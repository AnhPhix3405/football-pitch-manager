import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  vi: { translation: { brand: { name: 'PitchMaster', tagline: 'Điều hành sân bóng thông minh' }, nav: { home: 'Tổng quan', fields: 'Sân bóng', bookings: 'Đặt sân', posts: 'Kèo bóng', messages: 'Tin nhắn', settings: 'Cài đặt' } } },
  en: { translation: { brand: { name: 'PitchMaster', tagline: 'Smart football operations' }, nav: { home: 'Overview', fields: 'Fields', bookings: 'Bookings', posts: 'Matches', messages: 'Messages', settings: 'Settings' } } },
} as const

void i18n.use(initReactI18next).init({ resources, lng: 'vi', fallbackLng: 'vi', interpolation: { escapeValue: false } })
export default i18n
