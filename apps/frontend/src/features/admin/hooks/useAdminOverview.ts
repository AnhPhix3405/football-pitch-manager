import { useCallback, useEffect, useState } from 'react'
import type {
  AdminActivityMetricMode,
  AdminOverviewData,
  AdminOverviewDayRange,
} from '../interface/admin-overview.interface'
import { getAdminOverview } from '../service/admin.service'

export function useAdminOverview(initialDays: AdminOverviewDayRange = 30) {
  const [days, setDays] = useState<AdminOverviewDayRange>(initialDays)
  const [metricMode, setMetricMode] = useState<AdminActivityMetricMode>('bookings')
  const [overview, setOverview] = useState<AdminOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(
    async (targetDays: AdminOverviewDayRange, isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      try {
        const data = await getAdminOverview({
          days: targetDays,
          queueLimit: 6,
          auditLimit: 8,
        })
        setOverview(data)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải dữ liệu tổng quan hệ thống.'
        setError(message)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    void fetchOverview(days, false)
  }, [days, fetchOverview])

  const refetch = useCallback(() => {
    return fetchOverview(days, true)
  }, [days, fetchOverview])

  return {
    overview,
    isLoading,
    isRefreshing,
    error,
    days,
    setDays,
    metricMode,
    setMetricMode,
    refetch,
  }
}
