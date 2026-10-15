import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  vi: {
    translation: {
      brand: { name: 'PitchMaster', tagline: 'Điều hành sân bóng thông minh' },
      nav: { home: 'Tổng quan', fields: 'Sân bóng', bookings: 'Đặt sân', posts: 'Kèo bóng', messages: 'Tin nhắn', settings: 'Cài đặt' },
      chat: {
        eyebrow: 'COMMS_LINK',
        title: 'Tin nhắn',
        searchPlaceholder: 'Tìm hội thoại...',
        fieldChannel: 'Kênh liên hệ sân bóng',
        teamChannel: 'Trưởng nhóm đối thủ',
        infoAria: 'Thông tin hội thoại',
        attachAria: 'Đính kèm tệp',
        inputPlaceholder: 'Nhập tin nhắn...',
        sendAria: 'Gửi tin nhắn',
        emptyPrompt: 'Chọn một cuộc trò chuyện để bắt đầu.',
      },
      auth: {
        login: 'Đăng nhập',
        register: 'Tạo tài khoản mới',
        logout: 'Đăng xuất',
        profileSettings: 'Cài đặt & Hồ sơ',
        portalAdmin: 'Cổng quản trị',
        portalOwner: 'Quản lý sân bóng',
        portalPlayer: 'Lịch đặt & Hoạt động',
        guest: 'Khách vãng lai',
        role: 'Vai trò',
      },
    },
  },
  en: {
    translation: {
      brand: { name: 'PitchMaster', tagline: 'Smart football operations' },
      nav: { home: 'Overview', fields: 'Fields', bookings: 'Bookings', posts: 'Matches', messages: 'Messages', settings: 'Settings' },
      chat: {
        eyebrow: 'COMMS_LINK',
        title: 'Messages',
        searchPlaceholder: 'Search conversations...',
        fieldChannel: 'Pitch Contact Channel',
        teamChannel: 'Opponent Team Leader',
        infoAria: 'Conversation info',
        attachAria: 'Attach file',
        inputPlaceholder: 'Type a message...',
        sendAria: 'Send message',
        emptyPrompt: 'Select a conversation to start chatting.',
      },
      auth: {
        login: 'Sign In',
        register: 'Create Account',
        logout: 'Sign Out',
        profileSettings: 'Profile & Settings',
        portalAdmin: 'Command Center',
        portalOwner: 'Pitch Management',
        portalPlayer: 'My Bookings & Activity',
        guest: 'Guest',
        role: 'Role',
      },
    },
  },
} as const

void i18n.use(initReactI18next).init({ resources, lng: 'vi', fallbackLng: 'vi', interpolation: { escapeValue: false } })
export default i18n
