import { NOTIFICATION_TYPES } from '~/constants/notification.constant'
import type { AppNotification } from '../interfaces/notification.interface'

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: NOTIFICATION_TYPES.MATCH_REQUEST,
    title: 'Yêu cầu ghép trận mới',
    content: 'Đội Neon Strikers muốn tham gia ghép trận cùng bạn lúc 20:00.',
    createdAt: '5 phút trước',
    isRead: false,
    link: '/messages',
  },
  {
    id: 'n2',
    type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
    title: 'Đặt sân thành công',
    content: 'Lịch đặt Sector 4 · Alpha Pitch lúc 18:00 đã được xác nhận.',
    createdAt: '1 giờ trước',
    isRead: false,
    link: '/bookings',
  },
  {
    id: 'n3',
    type: NOTIFICATION_TYPES.MESSAGE,
    title: 'Tin nhắn từ chủ sân',
    content: 'Sector 4 Arena: Phòng thay đồ đã sẵn sàng đón tiếp đội bạn.',
    createdAt: 'Hôm qua',
    isRead: true,
    link: '/messages',
  },
]

export function getInitialNotifications(): AppNotification[] {
  return [...INITIAL_NOTIFICATIONS]
}

export function filterNotifications(
  items: AppNotification[],
  filter: 'all' | 'unread',
): AppNotification[] {
  return filter === 'unread' ? items.filter((n) => !n.isRead) : items
}

export function markAsReadInList(
  items: AppNotification[],
  id: string,
): AppNotification[] {
  return items.map((n) => (n.id === id ? { ...n, isRead: true } : n))
}

export function markAllAsReadInList(items: AppNotification[]): AppNotification[] {
  return items.map((n) => ({ ...n, isRead: true }))
}
