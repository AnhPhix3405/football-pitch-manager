import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { buildDashboardBreadcrumbs } from '../utils/breadcrumbs.util'

interface DashboardBreadcrumbsProps {
  mode: 'user' | 'owner' | 'admin'
}

export function DashboardBreadcrumbs({ mode }: DashboardBreadcrumbsProps) {
  const { t } = useTranslation()
  const location = useLocation()

  const breadcrumbs = buildDashboardBreadcrumbs(location.pathname, mode, t)

  const items = breadcrumbs.map((item, index) => {
    const isFirst = index === 0
    const isLast = index === breadcrumbs.length - 1

    const titleContent = (
      <span className="dashboard-breadcrumb__node">
        {isFirst && <HomeOutlined className="dashboard-breadcrumb__icon" />}
        <span>{item.title}</span>
      </span>
    )

    if (isLast || !item.path) {
      return {
        title: titleContent,
      }
    }

    return {
      title: <Link to={item.path}>{titleContent}</Link>,
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="dashboard-breadcrumbs-wrapper">
      <Breadcrumb
        className="dashboard-breadcrumbs"
        separator={<span className="dashboard-breadcrumbs__sep">/</span>}
        items={items}
      />
    </nav>
  )
}
