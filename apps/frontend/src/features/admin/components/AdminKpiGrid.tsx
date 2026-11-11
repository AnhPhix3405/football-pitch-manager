import {
  AlertOutlined,
  DollarOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type {
  AdminKpiGridProps,
  AdminKpiIconType,
} from '../interface/admin-overview.interface'
import { AdminSkeletonGrid } from './AdminSkeletonGrid'

function renderKpiIcon(iconType: AdminKpiIconType) {
  switch (iconType) {
    case 'users':
      return <TeamOutlined aria-hidden="true" />
    case 'fields':
      return <ShopOutlined aria-hidden="true" />
    case 'gmv':
      return <DollarOutlined aria-hidden="true" />
    case 'queue':
      return <AlertOutlined aria-hidden="true" />
    default:
      return null
  }
}

export function AdminKpiGrid({ items, isLoading }: AdminKpiGridProps) {
  if (isLoading && items.length === 0) {
    return <AdminSkeletonGrid count={4} />
  }

  return (
    <section className="admin-kpi-grid" aria-label="System Key Performance Indicators">
      {items.map((item) => (
        <article
          key={item.key}
          className={`admin-kpi-card admin-kpi-card--${item.key}`}
          tabIndex={0}
          aria-label={`${item.label}: ${item.value}, ${item.delta}`}
        >
          <div className="admin-kpi-card__header">
            <div className={`admin-kpi-card__icon-box admin-kpi-card__icon-box--${item.iconType}`}>
              {renderKpiIcon(item.iconType)}
            </div>
            <span
              className={`admin-kpi-card__delta ${
                item.isPositive
                  ? 'admin-kpi-card__delta--positive'
                  : 'admin-kpi-card__delta--negative'
              }`}
            >
              {item.delta}
            </span>
          </div>

          <div className="admin-kpi-card__body">
            <span className="admin-kpi-card__label">{item.label}</span>
            <strong className="admin-kpi-card__value">{item.value}</strong>
            <div className="admin-kpi-card__meter" aria-hidden="true">
              <span
                className={`admin-kpi-card__meter-fill ${
                  item.isPositive ? 'admin-kpi-card__meter-fill--pos' : 'admin-kpi-card__meter-fill--neg'
                }`}
              />
            </div>
            <span className="admin-kpi-card__sub">{item.sub}</span>
          </div>
        </article>
      ))}
    </section>
  )
}
