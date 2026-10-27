import type { NotificationType } from '~/constants/notification.constant'

export type NotificationFilter = 'all' | 'unread'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  content: string
  createdAt: string
  isRead: boolean
  link?: string
}

export type { NotificationType }
