import type {
  AdminActivityMetricMode,
  AdminOverviewDayRange,
  AdminPriorityQueueCategory,
} from '../interface/admin-overview.interface'

export const ADMIN_OVERVIEW_DAY_OPTIONS: ReadonlyArray<{
  value: AdminOverviewDayRange
  labelKey: string
  defaultLabel: string
}> = [
  { value: 7, labelKey: 'admin.days7', defaultLabel: '7 ngày' },
  { value: 14, labelKey: 'admin.days14', defaultLabel: '14 ngày' },
  { value: 30, labelKey: 'admin.days30', defaultLabel: '30 ngày' },
]

export const ADMIN_ACTIVITY_METRIC_OPTIONS: ReadonlyArray<{
  value: AdminActivityMetricMode
  labelKey: string
  defaultLabel: string
}> = [
  { value: 'bookings', labelKey: 'admin.modeBookings', defaultLabel: 'Đơn đặt' },
  { value: 'gmv', labelKey: 'admin.modeGmv', defaultLabel: 'GMV' },
  { value: 'users', labelKey: 'admin.modeUsers', defaultLabel: 'Người dùng' },
]

export const PRIORITY_QUEUE_ROUTE_MAP: Record<AdminPriorityQueueCategory, string> = {
  OWNER_APPROVAL: '/admin/approvals/owners',
  FIELD_APPROVAL: '/admin/approvals/fields',
  REVIEW_REPORT: '/admin/reports',
}

export const PRIORITY_QUEUE_TAG_MAP: Record<
  AdminPriorityQueueCategory,
  { color: string; label: string }
> = {
  OWNER_APPROVAL: { color: 'blue', label: 'CHỦ SÂN' },
  FIELD_APPROVAL: { color: 'cyan', label: 'SÂN BÓNG' },
  REVIEW_REPORT: { color: 'orange', label: 'BÁO CÁO' },
}

export const AUDIT_ACTION_BADGE_MAP: Record<
  string,
  { tone: 'success' | 'danger' | 'info' | 'warning'; label: string }
> = {
  APPROVE_OWNER: { tone: 'success', label: 'DUYỆT CHỦ SÂN' },
  REJECT_OWNER: { tone: 'danger', label: 'TỪ CHỐI CHỦ SÂN' },
  APPROVE_FIELD: { tone: 'success', label: 'DUYỆT SÂN BÓNG' },
  REJECT_FIELD: { tone: 'danger', label: 'TỪ CHỐI SÂN BÓNG' },
  PAYMENT_RECONCILED: { tone: 'info', label: 'THANH TOÁN' },
  PAYMENT_REFUNDED: { tone: 'warning', label: 'HOÀN TIỀN' },
}
