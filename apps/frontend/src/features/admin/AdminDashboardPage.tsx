import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminOverview } from '../../hooks/useAdminOverview'
import { AdminActivityChartPanel } from './components/AdminActivityChartPanel'
import { AdminCommandHeader } from './components/AdminCommandHeader'
import { AdminErrorBanner } from './components/AdminErrorBanner'
import { AdminKpiGrid } from './components/AdminKpiGrid'
import { AdminPriorityQueuePanel } from './components/AdminPriorityQueuePanel'
import { AdminRecentAuditPanel } from './components/AdminRecentAuditPanel'
import { AdminSystemHealthPanel } from './components/AdminSystemHealthPanel'
import {
  buildAdminKpiItems,
  computeTimelineBarHeights,
} from './utils/admin-overview.util'
import './AdminDashboardPage.css'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const {
    overview,
    isLoading,
    isRefreshing,
    error,
    days,
    setDays,
    metricMode,
    setMetricMode,
    refetch,
  } = useAdminOverview(30)

  const timelineBars = useMemo(
    () =>
      computeTimelineBarHeights(overview?.activityTimeline ?? [], metricMode),
    [overview?.activityTimeline, metricMode],
  )

  const kpiItems = useMemo(
    () => buildAdminKpiItems(overview?.metrics, t),
    [overview?.metrics, t],
  )

  return (
    <section className="admin-page admin-command-center" aria-label="Command Center">
      <AdminCommandHeader
        systemHealth={overview?.systemHealth}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={() => void refetch()}
      />

      {error && (
        <AdminErrorBanner
          error={error}
          onRetry={() => void refetch()}
        />
      )}

      <AdminKpiGrid
        items={kpiItems}
        isLoading={isLoading}
      />

      <div className="admin-command-grid">
        <AdminActivityChartPanel
          timelineBars={timelineBars}
          days={days}
          setDays={setDays}
          metricMode={metricMode}
          setMetricMode={setMetricMode}
        />

        <AdminSystemHealthPanel
          services={overview?.systemHealth.services ?? []}
        />

        <AdminPriorityQueuePanel
          items={overview?.priorityQueue ?? []}
        />

        <AdminRecentAuditPanel
          items={overview?.recentAudits ?? []}
        />
      </div>
    </section>
  )
}
