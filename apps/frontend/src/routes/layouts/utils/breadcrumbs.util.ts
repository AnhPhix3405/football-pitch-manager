import type { TFunction } from 'i18next'

export interface BreadcrumbItem {
  title: string
  path?: string
}

export function buildDashboardBreadcrumbs(
  pathname: string,
  mode: 'user' | 'owner' | 'admin',
  t: TFunction,
): BreadcrumbItem[] {
  const rootLabel =
    mode === 'admin'
      ? t('nav.portalAdmin', { defaultValue: 'Admin Portal' })
      : mode === 'owner'
        ? t('nav.portalOwner', { defaultValue: 'Owner Portal' })
        : t('nav.portalApp', { defaultValue: 'PitchMaster' })

  const rootPath = mode === 'admin' ? '/admin' : mode === 'owner' ? '/owner' : '/app'

  const items: BreadcrumbItem[] = [{ title: rootLabel, path: rootPath }]

  const normalized = pathname.replace(/\/+$/, '')

  if (normalized === rootPath) {
    items.push({ title: t('nav.overview', { defaultValue: 'Tổng quan' }) })
    return items
  }

  // Admin routes
  if (normalized.startsWith('/admin/approvals/owners')) {
    items.push({ title: t('nav.ownerApprovals', { defaultValue: 'Duyệt chủ sân' }) })
  } else if (normalized.startsWith('/admin/approvals/fields')) {
    items.push({ title: t('nav.fieldApprovals', { defaultValue: 'Duyệt sân bóng' }) })
  } else if (normalized.startsWith('/admin/management')) {
    items.push({ title: t('nav.management', { defaultValue: 'Quản lý & Kiểm duyệt' }) })
  } else if (normalized.startsWith('/admin/reports')) {
    items.push({ title: t('nav.reports', { defaultValue: 'Báo cáo & Giám sát' }) })
  } else if (normalized.startsWith('/admin/subscriptions')) {
    items.push({ title: t('nav.subscriptions', { defaultValue: 'Gói dịch vụ' }) })
  }
  // Owner routes
  else if (normalized.startsWith('/owner/fields')) {
    items.push({ title: t('nav.myFields', { defaultValue: 'Sân của tôi' }) })
  } else if (normalized.startsWith('/owner/services')) {
    items.push({ title: t('nav.services', { defaultValue: 'Dịch vụ & giá' }) })
  } else if (normalized.startsWith('/owner/bookings')) {
    items.push({ title: t('nav.bookings', { defaultValue: 'Booking' }) })
  } else if (normalized.startsWith('/owner/timeline')) {
    items.push({ title: t('nav.timeline', { defaultValue: 'Lịch vận hành' }) })
  } else if (normalized.startsWith('/owner/subscription')) {
    items.push({ title: t('nav.subscription', { defaultValue: 'Gói & giao dịch' }) })
  }
  // User/Player routes
  else if (normalized.startsWith('/app/fields')) {
    items.push({ title: t('nav.fields', { defaultValue: 'Sân bóng' }) })
  } else if (normalized.startsWith('/app/bookings')) {
    items.push({ title: t('nav.bookings', { defaultValue: 'Đặt sân' }) })
  } else if (normalized.startsWith('/app/opponents')) {
    items.push({ title: t('nav.opponents', { defaultValue: 'Tìm đối' }) })
  } else if (normalized.startsWith('/app/posts')) {
    items.push({ title: t('nav.posts', { defaultValue: 'Bài đăng' }) })
  } else if (normalized.startsWith('/app/messages')) {
    items.push({ title: t('nav.messages', { defaultValue: 'Tin nhắn' }) })
  } else if (normalized.startsWith('/app/settings')) {
    items.push({ title: t('nav.settings', { defaultValue: 'Cài đặt' }) })
  } else {
    // Fallback based on last slug
    const segments = normalized.split('/').filter(Boolean)
    if (segments.length > 1) {
      const last = segments[segments.length - 1]
      items.push({ title: last.charAt(0).toUpperCase() + last.slice(1) })
    }
  }

  return items
}
