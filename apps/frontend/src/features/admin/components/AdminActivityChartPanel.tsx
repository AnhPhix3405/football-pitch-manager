import { useTranslation } from 'react-i18next'
import {
  ADMIN_ACTIVITY_METRIC_OPTIONS,
  ADMIN_OVERVIEW_DAY_OPTIONS,
} from '../constants/admin-overview.constant'
import type { AdminActivityChartPanelProps } from '../interface/admin-overview.interface'
import { formatCompactVnd, formatFullVnd } from '../utils/admin-overview.util'

export function AdminActivityChartPanel({
  timelineBars,
  days,
  setDays,
  metricMode,
  setMetricMode,
}: AdminActivityChartPanelProps) {
  const { t } = useTranslation()

  return (
    <section className="admin-panel admin-activity-panel" aria-labelledby="admin-activity-title">
      <header className="admin-panel__head-controls">
        <div className="admin-panel__title-group">
          <h2 id="admin-activity-title" className="admin-panel__title">
            {t('admin.systemActivity', { defaultValue: 'Hoạt động hệ thống' })}
          </h2>
          <span className="admin-panel__eyebrow-chip">
            {t('admin.livePulse', { defaultValue: 'LIVE' })} · {days} DAYS
          </span>
        </div>

        <div className="admin-chart-toolbar">
          <div
            className="admin-segmented-group"
            role="radiogroup"
            aria-label={t('admin.selectChartMetric', { defaultValue: 'Chọn chỉ số biểu đồ' })}
          >
            {ADMIN_ACTIVITY_METRIC_OPTIONS.map((opt) => {
              const isActive = metricMode === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`admin-segmented-btn ${
                    isActive ? 'admin-segmented-btn--active' : ''
                  }`}
                  onClick={() => setMetricMode(opt.value)}
                >
                  {t(opt.labelKey, { defaultValue: opt.defaultLabel })}
                </button>
              )
            })}
          </div>

          <div
            className="admin-segmented-group"
            role="radiogroup"
            aria-label={t('admin.selectDayRange', { defaultValue: 'Chọn khoảng thời gian' })}
          >
            {ADMIN_OVERVIEW_DAY_OPTIONS.map((opt) => {
              const isActive = days === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`admin-segmented-btn ${
                    isActive ? 'admin-segmented-btn--active' : ''
                  }`}
                  onClick={() => setDays(opt.value)}
                >
                  {t(opt.labelKey, { defaultValue: opt.defaultLabel })}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {timelineBars.length === 0 ? (
        <div className="admin-empty-state" role="status">
          {t('common.noData', { defaultValue: 'Không có dữ liệu trong khoảng thời gian này.' })}
        </div>
      ) : (
        <div
          className="admin-activity-chart"
          role="region"
          aria-label={t('admin.activityChartAria', {
            days,
            defaultValue: `Biểu đồ hoạt động hệ thống ${days} ngày`,
          })}
        >
          {timelineBars.map((bar, index) => {
            const showDateTick =
              timelineBars.length <= 14 ||
              index === 0 ||
              index === timelineBars.length - 1 ||
              index % Math.ceil(timelineBars.length / 8) === 0

            return (
              <div
                key={bar.date}
                className="admin-activity-bar"
                tabIndex={0}
                aria-label={`Ngày ${bar.date}: ${bar.bookingsCount} đơn, GMV ${formatFullVnd(
                  bar.gmv,
                )}, ${bar.newUsersCount} TV mới`}
              >
                <div className="admin-activity-bar__tooltip" role="tooltip">
                  <div className="admin-activity-bar__tooltip-header">
                    <strong>{bar.date}</strong>
                    <span className="admin-activity-bar__tooltip-highlight">
                      {bar.displayValue}
                    </span>
                  </div>
                  <div className="admin-activity-bar__tooltip-body">
                    <span>Đơn: <strong>{bar.bookingsCount}</strong></span>
                    <span>GMV: <strong>{formatCompactVnd(bar.gmv)}</strong></span>
                    <span>User: <strong>+{bar.newUsersCount}</strong></span>
                  </div>
                </div>

                <div
                  className="admin-activity-bar__fill"
                  style={{ height: `${bar.heightPercent}%` }}
                />

                {showDateTick && (
                  <span className="admin-activity-bar__date" aria-hidden="true">
                    {bar.shortDateLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
