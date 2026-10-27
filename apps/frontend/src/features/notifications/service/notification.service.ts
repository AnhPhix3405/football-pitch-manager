import { apiClient, type ApiResponse } from '~/config/axios.config'
import type {
  AppNotification,
  NotificationFilter,
} from '../interfaces/notification.interface'

export function formatNotificationTime(dateString?: string): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Vừa xong'
    if (diffMinutes < 60) return `${diffMinutes} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return ''
  }
}

export function mapBackendNotification(item: {
  id: string
  type: string
  title: string
  content: string | null
  refId: string | null
  isRead: boolean
  createdAt: string
  link?: string
}): AppNotification {
  return {
    id: item.id,
    type: item.type as AppNotification['type'],
    title: item.title,
    content: item.content || '',
    createdAt: formatNotificationTime(item.createdAt),
    isRead: item.isRead,
    link: item.link,
  }
}

export async function getNotificationsApi(
  filter?: NotificationFilter,
  limit = 20,
): Promise<AppNotification[]> {
  const response = await apiClient.get<
    ApiResponse<
      Array<{
        id: string
        type: string
        title: string
        content: string | null
        refId: string | null
        isRead: boolean
        createdAt: string
        link?: string
      }>
    >
  >('/notifications', {
    params: {
      filter: filter === 'all' ? undefined : filter,
      limit,
    },
  })
  const list = response.data?.data ?? []
  return list.map(mapBackendNotification)
}

export async function getUnreadCountApi(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    '/notifications/unread-count',
  )
  return response.data?.data?.count ?? 0
}

export async function markNotificationAsReadApi(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`)
}

export async function markAllNotificationsAsReadApi(): Promise<void> {
  await apiClient.patch('/notifications/read-all')
}

export function filterNotifications(
  items: AppNotification[],
  filter: NotificationFilter,
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
