import type {
  AdminActivityBarItem,
  AdminActivityMetricMode,
  AdminActivityPoint,
  AdminKpiItem,
  AdminOverviewMetrics,
} from '../interface/admin-overview.interface'

export function formatCompactVnd(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0
  if (safe >= 1_000_000_000) {
    return `${(safe / 1_000_000_000).toFixed(2).replace('.', ',')} tỷ`
  }
  if (safe >= 1_000_000) {
    return `${(safe / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} tr`
  }
  if (safe >= 1_000) {
    return `${Math.round(safe / 1_000).toLocaleString('vi-VN')}k`
  }
  return `${safe.toLocaleString('vi-VN')}đ`
}

export function formatFullVnd(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0
  return `${Math.round(safe).toLocaleString('vi-VN')}đ`
}

export function formatGrowthDelta(percent: number): string {
  const safe = Number.isFinite(percent) ? percent : 0
  const sign = safe >= 0 ? '+' : ''
  return `${sign}${safe.toFixed(1)}%`
}

export function formatShortDateTime(isoString: string): string {
  if (!isoString) return '--:--'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month} ${hours}:${minutes}`
}

export function computeTimelineBarHeights(
  points: AdminActivityPoint[],
  mode: AdminActivityMetricMode,
): AdminActivityBarItem[] {
  if (!Array.isArray(points) || points.length === 0) {
    return []
  }

  const rawValues = points.map((p) => {
    if (mode === 'gmv') return p.gmv
    if (mode === 'users') return p.newUsersCount
    return p.bookingsCount
  })

  const maxValue = Math.max(...rawValues, 1)

  return points.map((point, index) => {
    const val = rawValues[index] ?? 0
    const heightPercent = val === 0 ? 6 : Math.max(12, Math.round((val / maxValue) * 70))

    let displayValue = `${point.bookingsCount} đơn`
    if (mode === 'gmv') {
      displayValue = formatCompactVnd(point.gmv)
    } else if (mode === 'users') {
      displayValue =
        point.newUsersCount > 0
          ? `+${point.newUsersCount} người dùng`
          : '0 người dùng'
    }

    const parts = point.date.split('-')
    const shortDateLabel =
      parts.length === 3 ? `${parts[2]}/${parts[1]}` : point.date

    return {
      ...point,
      heightPercent,
      displayValue,
      shortDateLabel,
    }
  })
}

export function getServiceHealthColor(status: 'up' | 'degraded' | 'down'): string {
  if (status === 'up') return '#8cfc70'
  if (status === 'degraded') return '#faad14'
  return '#ff4d4f'
}

export function getServiceHealthTagColor(status: 'up' | 'degraded' | 'down'): 'green' | 'orange' | 'red' {
  if (status === 'up') return 'green'
  if (status === 'degraded') return 'orange'
  return 'red'
}

export type ServiceIconKind = 'database' | 'realtime' | 'cache' | 'api'

export function getServiceIconKind(serviceName: string): ServiceIconKind {
  const lower = (serviceName || '').toLowerCase()
  if (lower.includes('database') || lower.includes('db') || lower.includes('postgres')) {
    return 'database'
  }
  if (lower.includes('realtime') || lower.includes('socket')) {
    return 'realtime'
  }
  if (lower.includes('cache') || lower.includes('redis')) {
    return 'cache'
  }
  return 'api'
}

export function buildAdminKpiItems(
  metrics: AdminOverviewMetrics | undefined,
  t: (key: string, options?: { defaultValue?: string; [k: string]: unknown }) => string,
): AdminKpiItem[] {
  const usersGrowth = metrics?.users.growthPercent ?? 0
  const gmvGrowth = metrics?.gmv.growthPercent ?? 0

  return [
    {
      key: 'users',
      label: t('admin.metricUsers', { defaultValue: 'NGƯỜI DÙNG' }),
      value: (metrics?.users.total ?? 0).toLocaleString('vi-VN'),
      delta: formatGrowthDelta(usersGrowth),
      isPositive: usersGrowth >= 0,
      sub: `User: ${metrics?.users.byRole.user ?? 0} · Owner: ${metrics?.users.byRole.owner ?? 0} (+${metrics?.users.newThisMonth ?? 0} tháng này)`,
      iconType: 'users',
    },
    {
      key: 'fields',
      label: t('admin.metricActiveFields', { defaultValue: 'SÂN HOẠT ĐỘNG' }),
      value: `${metrics?.fields.active ?? 0}/${metrics?.fields.total ?? 0}`,
      delta: `+${metrics?.fields.newThisMonth ?? 0} tháng này`,
      isPositive: true,
      sub: `Đang chờ duyệt: ${metrics?.fields.pending ?? 0} cụm sân`,
      iconType: 'fields',
    },
    {
      key: 'gmv',
      label: t('admin.metricGmv', { defaultValue: 'GMV THÁNG' }),
      value: formatCompactVnd(metrics?.gmv.currentMonthGmv ?? 0),
      delta: formatGrowthDelta(gmvGrowth),
      isPositive: gmvGrowth >= 0,
      sub: `Thực thu: ${formatCompactVnd(metrics?.gmv.totalPaidRevenue ?? 0)}`,
      iconType: 'gmv',
    },
    {
      key: 'queue',
      label: t('admin.metricQueue', { defaultValue: 'CẦN XỬ LÝ' }),
      value: String(metrics?.queue.totalPending ?? 0),
      delta: t('admin.profileDossiers', {
        count:
          (metrics?.queue.pendingOwnerApprovals ?? 0) +
          (metrics?.queue.pendingFieldApprovals ?? 0),
        defaultValue: `${(metrics?.queue.pendingOwnerApprovals ?? 0) + (metrics?.queue.pendingFieldApprovals ?? 0)} yêu cầu chờ duyệt`,
      }),
      isPositive: (metrics?.queue.totalPending ?? 0) === 0,
      sub: `Chủ sân: ${metrics?.queue.pendingOwnerApprovals ?? 0} · Sân: ${metrics?.queue.pendingFieldApprovals ?? 0} · Báo cáo: ${metrics?.queue.flaggedReviews ?? 0}`,
      iconType: 'queue',
    },
  ]
}
