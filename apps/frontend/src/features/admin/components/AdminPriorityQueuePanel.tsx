import { ArrowRightOutlined, InboxOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  PRIORITY_QUEUE_ROUTE_MAP,
  PRIORITY_QUEUE_TAG_MAP,
} from '../constants/admin-overview.constant'
import type { AdminPriorityQueuePanelProps } from '../interface/admin-overview.interface'
import { formatShortDateTime } from '../utils/admin-overview.util'

export function AdminPriorityQueuePanel({ items }: AdminPriorityQueuePanelProps) {
  const { t } = useTranslation()

  return (
    <section className="admin-panel admin-queue-panel" aria-labelledby="admin-queue-title">
      <header className="admin-panel__head">
        <h2 id="admin-queue-title" className="admin-panel__title">
          {t('admin.priorityQueue', { defaultValue: 'Hàng đợi ưu tiên' })}
        </h2>
        <Link to="/admin/approvals/owners" className="admin-panel__action-link">
          <span>{t('admin.openQueue', { defaultValue: 'Mở hàng đợi' })}</span>
          <ArrowRightOutlined aria-hidden="true" />
        </Link>
      </header>

      {!items || items.length === 0 ? (
        <div className="admin-empty-state" role="status">
          <InboxOutlined className="admin-empty-state__icon" aria-hidden="true" />
          <p className="admin-empty-state__text">
            {t('admin.noPendingQueue', {
              defaultValue: 'Không có hồ sơ nào đang chờ duyệt.',
            })}
          </p>
        </div>
      ) : (
        <div className="admin-queue-list">
          {items.map((request) => {
            const tagMeta = PRIORITY_QUEUE_TAG_MAP[request.category] ?? {
              color: 'blue',
              label: request.category,
            }
            const targetRoute =
              PRIORITY_QUEUE_ROUTE_MAP[request.category] ?? '/admin/approvals/owners'

            return (
              <Link
                key={`${request.category}-${request.id}`}
                to={targetRoute}
                className="admin-queue-item-card"
              >
                <div className="admin-queue-item-card__main">
                  <strong className="admin-queue-item-card__title">
                    {request.title}
                  </strong>
                  <div className="admin-queue-item-card__meta">
                    <span className="admin-queue-item-card__email">
                      {request.requesterEmail}
                    </span>
                    <span className="admin-queue-item-card__divider" aria-hidden="true">·</span>
                    <time className="admin-queue-item-card__time">
                      {formatShortDateTime(request.createdAt)}
                    </time>
                  </div>
                </div>
                <Tag color={tagMeta.color} className="admin-queue-item-card__tag">
                  {tagMeta.label}
                </Tag>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
