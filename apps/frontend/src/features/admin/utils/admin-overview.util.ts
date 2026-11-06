import type {
  AdminActivityBarItem,
  AdminActivityMetricMode,
  AdminActivityPoint,
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

export function formatUptime(seconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
  const days = Math.floor(safe / 86400)
  const hours = Math.floor((safe % 86400) / 3600)
  const minutes = Math.floor((safe % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
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
    const heightPercent = val === 0 ? 8 : Math.max(14, Math.round((val / maxValue) * 100))

    let displayValue = `${point.bookingsCount} đơn`
    if (mode === 'gmv') {
      displayValue = formatCompactVnd(point.gmv)
    } else if (mode === 'users') {
      displayValue = `${point.newUsersCount} TV`
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
