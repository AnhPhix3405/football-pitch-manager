import {
  ApiOutlined,
  ClockCircleOutlined,
  ClusterOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { Progress, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { AdminSystemHealthPanelProps } from '../interface/admin-overview.interface'
import {
  getServiceHealthColor,
  getServiceHealthTagColor,
  getServiceIconKind,
  type ServiceIconKind,
} from '../utils/admin-overview.util'

function renderServiceIcon(kind: ServiceIconKind) {
  switch (kind) {
    case 'database':
      return <DatabaseOutlined aria-hidden="true" />
    case 'realtime':
      return <ClockCircleOutlined aria-hidden="true" />
    case 'cache':
      return <ClusterOutlined aria-hidden="true" />
    case 'api':
    default:
      return <ApiOutlined aria-hidden="true" />
  }
}

export function AdminSystemHealthPanel({ services }: AdminSystemHealthPanelProps) {
  const { t } = useTranslation()

  return (
    <section className="admin-panel admin-health-panel" aria-labelledby="admin-health-title">
      <header className="admin-panel__head">
        <h2 id="admin-health-title" className="admin-panel__title">
          {t('admin.systemHealth', { defaultValue: 'Sức khỏe hệ thống' })}
        </h2>
        <span className="admin-health-nodes-count">
          {services.length} NODES
        </span>
      </header>

      {services.length === 0 ? (
        <div className="admin-empty-state" role="status">
          {t('common.noData', { defaultValue: 'Không có dữ liệu nút dịch vụ.' })}
        </div>
      ) : (
        <div className="admin-health-list">
          {services.map((node) => {
            const iconKind = getServiceIconKind(node.name)
            const strokeColor = getServiceHealthColor(node.status)
            const tagColor = getServiceHealthTagColor(node.status)

            return (
              <div key={node.name} className="admin-health-row">
                <div className="admin-health-row__head">
                  <span className="admin-health-row__name">
                    <span className={`admin-service-icon admin-service-icon--${iconKind}`}>
                      {renderServiceIcon(iconKind)}
                    </span>
                    <strong>{node.name}</strong>
                  </span>
                  <div className="admin-health-row__meta">
                    <span className="admin-health-latency">
                      {node.latencyMs}ms
                    </span>
                    <Tag color={tagColor} className="admin-health-tag">
                      {node.status.toUpperCase()}
                    </Tag>
                  </div>
                </div>

                <div className="admin-health-row__progress">
                  <Progress
                    percent={node.score}
                    size="small"
                    strokeColor={strokeColor}
                    trailColor="rgba(255, 255, 255, 0.08)"
                    showInfo={false}
                  />
                  <span className="admin-health-score-val">{node.score}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
