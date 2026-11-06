import {
  AlertOutlined,
  ApiOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DatabaseOutlined,
  DollarOutlined,
  ReloadOutlined,
  ShopOutlined,
  TeamOutlined,
  WarningFilled,
} from '@ant-design/icons'
import { Progress, Tag } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAdminOverview } from '../../hooks/useAdminOverview'
import {
  ADMIN_ACTIVITY_METRIC_OPTIONS,
  ADMIN_OVERVIEW_DAY_OPTIONS,
  AUDIT_ACTION_BADGE_MAP,
  PRIORITY_QUEUE_ROUTE_MAP,
  PRIORITY_QUEUE_TAG_MAP,
} from './constants/admin-overview.constant'
import {
  computeTimelineBarHeights,
  formatCompactVnd,
  formatFullVnd,
  formatGrowthDelta,
  formatShortDateTime,
  formatUptime,
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

  const isOperational = overview?.systemHealth.status !== 'degraded'

  const kpiCards = useMemo(() => {
    const m = overview?.metrics
    const usersGrowth = m?.users.growthPercent ?? 0
    const gmvGrowth = m?.gmv.growthPercent ?? 0

    return [
      {
        key: 'users',
        label: t('admin.metricUsers', { defaultValue: 'NGƯỜI DÙNG' }),
        value: (m?.users.total ?? 0).toLocaleString('vi-VN'),
        delta: formatGrowthDelta(usersGrowth),
        isPositive: usersGrowth >= 0,
        sub: `User: ${m?.users.byRole.user ?? 0} · Owner: ${m?.users.byRole.owner ?? 0} (+${m?.users.newThisMonth ?? 0} tháng này)`,
        icon: <TeamOutlined />,
      },
      {
        key: 'fields',
        label: t('admin.metricActiveFields', { defaultValue: 'SÂN HOẠT ĐỘNG' }),
        value: `${m?.fields.active ?? 0}/${m?.fields.total ?? 0}`,
        delta: `+${m?.fields.newThisMonth ?? 0} tháng này`,
        isPositive: true,
        sub: `Đang chờ duyệt: ${m?.fields.pending ?? 0} cụm sân`,
        icon: <ShopOutlined />,
      },
      {
        key: 'gmv',
        label: t('admin.metricGmv', { defaultValue: 'GMV THÁNG' }),
        value: formatCompactVnd(m?.gmv.currentMonthGmv ?? 0),
        delta: formatGrowthDelta(gmvGrowth),
        isPositive: gmvGrowth >= 0,
        sub: `Thực thu: ${formatCompactVnd(m?.gmv.totalPaidRevenue ?? 0)}`,
        icon: <DollarOutlined />,
      },
      {
        key: 'queue',
        label: t('admin.metricQueue', { defaultValue: 'CẦN XỬ LÝ' }),
        value: String(m?.queue.totalPending ?? 0),
        delta: `${(m?.queue.pendingOwnerApprovals ?? 0) + (m?.queue.pendingFieldApprovals ?? 0)} hồ sơ duyệt`,
        isPositive: (m?.queue.totalPending ?? 0) === 0,
        sub: `Chủ sân: ${m?.queue.pendingOwnerApprovals ?? 0} · Sân: ${m?.queue.pendingFieldApprovals ?? 0} · Báo cáo: ${m?.queue.flaggedReviews ?? 0}`,
        icon: <AlertOutlined />,
      },
    ]
  }, [overview?.metrics, t])

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('database')) {
      return <DatabaseOutlined />
    }
    if (serviceName.toLowerCase().includes('realtime')) {
      return <ClockCircleOutlined />
    }
    return <ApiOutlined />
  }

  return (
    <section className="admin-page">
      <header className="user-page__head">
        <div>
          <span className="eyebrow">SYSTEM COMMAND CENTER</span>
          <h1>{t('admin.dashboardTitle', { defaultValue: 'Command Center' })}</h1>
          <p>
            {t('admin.dashboardSubtitle', {
              defaultValue: 'Toàn cảnh vận hành mạng lưới PitchMaster.',
            })}
          </p>
        </div>

        <div className="admin-overview-header-actions">
          {overview?.systemHealth && (
            <span className="admin-uptime-pill">
              <ClockCircleOutlined />
              {t('admin.uptimeLabel', { defaultValue: 'Uptime' })}:{' '}
              {formatUptime(overview.systemHealth.uptimeSeconds)}
            </span>
          )}

          <Tag color={isOperational ? 'green' : 'orange'}>
            {isOperational ? <CheckCircleFilled /> : <WarningFilled />}{' '}
            {isOperational
              ? t('admin.statusOperational', {
                  defaultValue: 'ALL SYSTEMS OPERATIONAL',
                })
              : t('admin.statusDegraded', {
                  defaultValue: 'SYSTEM DEGRADED',
                })}
          </Tag>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => void refetch()}
            disabled={isLoading || isRefreshing}
            aria-label={t('admin.refreshData', { defaultValue: 'Làm mới dữ liệu' })}
          >
            <ReloadOutlined spin={isRefreshing} />
            {t('admin.refreshData', { defaultValue: 'Làm mới' })}
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-error-banner" role="alert">
          <span>
            {t('admin.loadOverviewError', {
              defaultValue: 'Không thể tải số liệu tổng quan hệ thống.',
            })}{' '}
            ({error})
          </span>
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => void refetch()}
          >
            {t('admin.retryButton', { defaultValue: 'Thử lại' })}
          </button>
        </div>
      )}

      {isLoading && !overview ? (
        <div
          className="admin-skeleton-grid"
          aria-busy="true"
          aria-label="Đang tải số liệu tổng quan"
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="admin-skeleton-box" />
          ))}
        </div>
      ) : (
        <div className="admin-metrics">
          {kpiCards.map((item) => (
            <article key={item.key} className="admin-kpi-card">
              <div className="admin-kpi-card__top">
                <span>{item.icon}</span>
                <em
                  className={`admin-kpi-card__delta ${
                    item.isPositive
                      ? 'admin-kpi-card__delta--positive'
                      : 'admin-kpi-card__delta--negative'
                  }`}
                >
                  {item.delta}
                </em>
              </div>
              <small>{item.label}</small>
              <strong className="admin-kpi-card__value">{item.value}</strong>
              <span className="admin-kpi-card__sub">{item.sub}</span>
            </article>
          ))}
        </div>
      )}

      <div className="admin-command-grid">
        <section className="admin-panel">
          <header className="admin-panel__head-controls">
            <div>
              <h2>
                {t('admin.systemActivity', {
                  defaultValue: 'Hoạt động hệ thống',
                })}
              </h2>
              <span className="eyebrow">LIVE / {days} DAYS</span>
            </div>

            <div className="admin-chart-toolbar">
              <div
                className="admin-segmented-group"
                role="group"
                aria-label="Chọn chỉ số biểu đồ"
              >
                {ADMIN_ACTIVITY_METRIC_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`admin-segmented-btn ${
                      metricMode === opt.value
                        ? 'admin-segmented-btn--active'
                        : ''
                    }`}
                    onClick={() => setMetricMode(opt.value)}
                  >
                    {t(opt.labelKey, { defaultValue: opt.defaultLabel })}
                  </button>
                ))}
              </div>

              <div
                className="admin-segmented-group"
                role="group"
                aria-label="Chọn khoảng ngày"
              >
                {ADMIN_OVERVIEW_DAY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`admin-segmented-btn ${
                      days === opt.value ? 'admin-segmented-btn--active' : ''
                    }`}
                    onClick={() => setDays(opt.value)}
                  >
                    {t(opt.labelKey, { defaultValue: opt.defaultLabel })}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div
            className="admin-activity-chart"
            role="region"
            aria-label={`Biểu đồ hoạt động ${days} ngày`}
          >
            {timelineBars.map((bar, index) => {
              const showDateTick =
                timelineBars.length <= 14 ||
                index === 0 ||
                index === timelineBars.length - 1 ||
                index % 5 === 0

              return (
                <div
                  key={bar.date}
                  className="admin-activity-bar"
                  tabIndex={0}
                  aria-label={`Ngày ${bar.date}: ${bar.bookingsCount} đơn đặt, GMV ${formatFullVnd(bar.gmv)}, ${bar.newUsersCount} người dùng mới`}
                >
                  <div className="admin-activity-bar__tooltip">
                    <strong>{bar.date}</strong> · {bar.displayValue}
                    <br />
                    <span>
                      Đơn: {bar.bookingsCount} · GMV: {formatCompactVnd(bar.gmv)}{' '}
                      · User: +{bar.newUsersCount}
                    </span>
                  </div>
                  <div
                    className="admin-activity-bar__fill"
                    style={{ height: `${bar.heightPercent}%` }}
                  />
                  {showDateTick && (
                    <span className="admin-activity-bar__date">
                      {bar.shortDateLabel}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="admin-panel health-panel">
          <header>
            <h2>
              {t('admin.systemHealth', { defaultValue: 'Sức khỏe hệ thống' })}
            </h2>
          </header>
          {(overview?.systemHealth.services ?? []).map((node) => (
            <div key={node.name} className="admin-health-row">
              <div className="admin-health-row__head">
                <span>
                  {getServiceIcon(node.name)} {node.name}
                </span>
                <span className="admin-health-row__meta">
                  <span>{node.latencyMs}ms</span>
                  <Tag
                    color={
                      node.status === 'up'
                        ? 'green'
                        : node.status === 'degraded'
                          ? 'orange'
                          : 'red'
                    }
                    style={{ margin: 0 }}
                  >
                    {node.status.toUpperCase()}
                  </Tag>
                </span>
              </div>
              <Progress
                percent={node.score}
                size="small"
                strokeColor={node.status === 'up' ? '#8cfc70' : '#faad14'}
                trailColor="#263125"
              />
            </div>
          ))}
        </section>

        <section className="admin-panel queue-panel">
          <header>
            <h2>
              {t('admin.priorityQueue', {
                defaultValue: 'Hàng đợi ưu tiên',
              })}
            </h2>
            <Link to="/admin/approvals/owners">
              {t('admin.openQueue', { defaultValue: 'Mở hàng đợi' })}{' '}
              <ArrowRightOutlined />
            </Link>
          </header>

          {!overview?.priorityQueue || overview.priorityQueue.length === 0 ? (
            <div className="admin-empty-state" role="status">
              {t('admin.noPendingQueue', {
                defaultValue: 'Không có hồ sơ nào đang chờ duyệt.',
              })}
            </div>
          ) : (
            overview.priorityQueue.map((request) => {
              const tagMeta = PRIORITY_QUEUE_TAG_MAP[request.category] ?? {
                color: 'blue',
                label: request.category,
              }
              const targetRoute =
                PRIORITY_QUEUE_ROUTE_MAP[request.category] ??
                '/admin/approvals/owners'

              return (
                <Link
                  key={`${request.category}-${request.id}`}
                  to={targetRoute}
                  className="admin-queue-item-link"
                >
                  <span>
                    <b>{request.title}</b>
                    <small>
                      {request.requesterEmail} ·{' '}
                      {formatShortDateTime(request.createdAt)}
                    </small>
                  </span>
                  <Tag color={tagMeta.color}>{tagMeta.label}</Tag>
                </Link>
              )
            })
          )}
        </section>

        <section className="admin-panel">
          <header>
            <h2>
              {t('admin.recentAudit', {
                defaultValue: 'Nhật ký Audit gần đây',
              })}
            </h2>
            <Link to="/admin/reports">
              {t('common.all', { defaultValue: 'Xem tất cả' })}{' '}
              <ArrowRightOutlined />
            </Link>
          </header>

          {!overview?.recentAudits || overview.recentAudits.length === 0 ? (
            <div className="admin-empty-state" role="status">
              {t('admin.noRecentAudits', {
                defaultValue: 'Chưa có sự kiện kiểm toán nào gần đây.',
              })}
            </div>
          ) : (
            overview.recentAudits.map((log) => {
              const badge = AUDIT_ACTION_BADGE_MAP[log.action] ?? {
                tone: 'info' as const,
                label: log.action,
              }

              return (
                <div className="audit-line" key={`${log.action}-${log.id}`}>
                  <i />
                  <span>
                    <b>
                      <span
                        className={`admin-audit-badge admin-audit-badge--${badge.tone}`}
                      >
                        {badge.label}
                      </span>
                    </b>
                    <small>
                      {log.actor} → {log.target}
                    </small>
                  </span>
                  <time className="admin-audit-time">
                    {formatShortDateTime(log.timestamp)}
                  </time>
                </div>
              )
            })
          )}
        </section>
      </div>
    </section>
  )
}
