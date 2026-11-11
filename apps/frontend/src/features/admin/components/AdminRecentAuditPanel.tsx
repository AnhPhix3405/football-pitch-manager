import { ArrowRightOutlined, HistoryOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AUDIT_ACTION_BADGE_MAP } from '../constants/admin-overview.constant'
import type { AdminRecentAuditPanelProps } from '../interface/admin-overview.interface'
import { formatShortDateTime } from '../utils/admin-overview.util'

export function AdminRecentAuditPanel({ items }: AdminRecentAuditPanelProps) {
  const { t } = useTranslation()

  return (
    <section className="admin-panel admin-audit-panel" aria-labelledby="admin-audit-title">
      <header className="admin-panel__head">
        <h2 id="admin-audit-title" className="admin-panel__title">
          {t('admin.recentAudit', { defaultValue: 'Nhật ký Audit gần đây' })}
        </h2>
        <Link to="/admin/reports" className="admin-panel__action-link">
          <span>{t('common.all', { defaultValue: 'Xem tất cả' })}</span>
          <ArrowRightOutlined aria-hidden="true" />
        </Link>
      </header>

      {!items || items.length === 0 ? (
        <div className="admin-empty-state" role="status">
          <HistoryOutlined className="admin-empty-state__icon" aria-hidden="true" />
          <p className="admin-empty-state__text">
            {t('admin.noRecentAudits', {
              defaultValue: 'Chưa có sự kiện kiểm toán nào gần đây.',
            })}
          </p>
        </div>
      ) : (
        <div className="admin-audit-stream" role="feed" aria-label="Recent Audit Stream">
          {items.map((log) => {
            const badge = AUDIT_ACTION_BADGE_MAP[log.action] ?? {
              tone: 'info' as const,
              label: log.action,
            }

            return (
              <article
                className={`admin-audit-row admin-audit-row--${badge.tone}`}
                key={`${log.action}-${log.id}`}
              >
                <div className="admin-audit-row__indicator" aria-hidden="true">
                  <span className="admin-audit-row__dot" />
                  <span className="admin-audit-row__line" />
                </div>

                <div className="admin-audit-row__content">
                  <div className="admin-audit-row__top">
                    <span className={`admin-audit-badge admin-audit-badge--${badge.tone}`}>
                      {badge.label}
                    </span>
                    <time className="admin-audit-row__time">
                      {formatShortDateTime(log.timestamp)}
                    </time>
                  </div>

                  <div className="admin-audit-row__actors">
                    <span className="admin-audit-actor">{log.actor}</span>
                    <span className="admin-audit-arrow" aria-hidden="true">→</span>
                    <span className="admin-audit-target">{log.target}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
