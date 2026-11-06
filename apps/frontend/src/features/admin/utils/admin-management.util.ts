import type {
  AdminPostStatus,
  AdminReviewModerationStatus,
  AdminUserRole,
  AdminUserStatus,
  ManagementTab,
} from '../interface/admin-management.interface'

export function parseManagementTabParam(raw: string | null): ManagementTab {
  if (raw === 'posts' || raw === 'reviews' || raw === 'users') {
    return raw
  }
  return 'users'
}

export function formatAdminDate(isoString: string, locale = 'vi-VN'): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatAdminDateTime(
  isoString: string,
  locale = 'vi-VN',
): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatPlaySlot(
  playDate: string,
  startTime: string,
  endTime: string,
): string {
  const shortStart = startTime ? startTime.slice(0, 5) : ''
  const shortEnd = endTime ? endTime.slice(0, 5) : ''
  if (shortStart && shortEnd) {
    return `${playDate} • ${shortStart} - ${shortEnd}`
  }
  return playDate || '—'
}

export function getUserRoleBadgeTone(
  role: AdminUserRole,
): 'admin' | 'owner' | 'user' {
  if (role === 'admin') return 'admin'
  if (role === 'owner') return 'owner'
  return 'user'
}

export function getUserStatusBadgeTone(
  status: AdminUserStatus,
): 'active' | 'locked' | 'pending' {
  if (status === 'suspended') return 'locked'
  if (status === 'active') return 'active'
  return 'pending'
}

export function getPostStatusBadgeTone(
  status: AdminPostStatus,
): 'active' | 'pending' | 'resolved' {
  if (status === 'open') return 'active'
  if (status === 'matched') return 'pending'
  return 'resolved'
}

export function getReviewStatusBadgeTone(
  status: AdminReviewModerationStatus,
): 'pending' | 'resolved' {
  return status === 'resolved' ? 'resolved' : 'pending'
}

export function extractAdminErrorMessage(
  err: unknown,
  fallbackMessage: string,
): string {
  if (err && typeof err === 'object') {
    const maybeAxios = err as {
      response?: { data?: { message?: string | string[] } }
      message?: string
    }
    const apiMessage = maybeAxios.response?.data?.message
    if (Array.isArray(apiMessage) && apiMessage.length > 0) {
      return String(apiMessage[0])
    }
    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
      return apiMessage
    }
    if (
      typeof maybeAxios.message === 'string' &&
      maybeAxios.message.trim().length > 0
    ) {
      return maybeAxios.message
    }
  }
  return fallbackMessage
}
