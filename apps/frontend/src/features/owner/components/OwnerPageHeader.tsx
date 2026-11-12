import {
  AppstoreOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PictureOutlined,
  SettingOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import { Breadcrumb } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type {
  OwnerFieldSubTabKey,
  OwnerPageHeaderProps,
  OwnerTabItem,
} from '../interface/owner-header.types'
import './OwnerPageHeader.css'

export function OwnerPageHeader({
  title,
  subtitle,
  icon,
  breadcrumbs,
  eyebrow,
  actions,
  tabs,
  className = '',
  fieldId,
  activeTabKey,
}: OwnerPageHeaderProps) {
  const { t } = useTranslation()

  // Generate standard field sub-tabs if fieldId is provided and custom tabs are not passed
  const resolvedTabs: OwnerTabItem[] = React.useMemo(() => {
    if (tabs) return tabs
    if (!fieldId) return []

    const defaultTabs: { key: OwnerFieldSubTabKey; label: string; icon: React.ReactNode; path: string }[] = [
      {
        key: 'courts',
        label: t('owner.fieldTabs.courts', { defaultValue: 'Sân con' }),
        icon: <AppstoreOutlined />,
        path: `/owner/fields/${fieldId}/courts`,
      },
      {
        key: 'services',
        label: t('owner.fieldTabs.services', { defaultValue: 'Dịch vụ đi kèm' }),
        icon: <ShoppingOutlined />,
        path: `/owner/fields/${fieldId}/services`,
      },
      {
        key: 'pricing',
        label: t('owner.fieldTabs.pricing', { defaultValue: 'Bảng giá' }),
        icon: <DollarOutlined />,
        path: `/owner/fields/${fieldId}/pricing`,
      },
      {
        key: 'hours',
        label: t('owner.fieldTabs.hours', { defaultValue: 'Giờ mở cửa' }),
        icon: <ClockCircleOutlined />,
        path: `/owner/fields/${fieldId}/opening-hours`,
      },
      {
        key: 'images',
        label: t('owner.fieldTabs.images', { defaultValue: 'Hình ảnh' }),
        icon: <PictureOutlined />,
        path: `/owner/fields/${fieldId}/images`,
      },
      {
        key: 'edit',
        label: t('owner.fieldTabs.edit', { defaultValue: 'Cấu hình sân' }),
        icon: <SettingOutlined />,
        path: `/owner/fields/${fieldId}/edit`,
      },
    ]

    return defaultTabs.map((tab) => ({
      key: tab.key,
      label: tab.label,
      icon: tab.icon,
      to: tab.path,
      active: activeTabKey === tab.key,
    }))
  }, [tabs, fieldId, activeTabKey, t])

  return (
    <header className={`owner-page-header ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          className="owner-page-header__breadcrumb"
          items={breadcrumbs.map((b) => ({
            title: b.href ? <Link to={b.href}>{b.title}</Link> : b.title,
          }))}
        />
      )}

      <div className="owner-page-header__main">
        <div className="owner-page-header__title-group">
          {icon && <div className="owner-page-header__icon-badge">{icon}</div>}
          <div className="owner-page-header__text">
            {eyebrow && <span className="owner-page-header__eyebrow">{eyebrow}</span>}
            <h1 className="owner-page-header__title">{title}</h1>
            {subtitle && <p className="owner-page-header__subtitle">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="owner-page-header__actions">{actions}</div>}
      </div>

      {resolvedTabs.length > 0 && (
        <nav className="owner-page-header__tabs" aria-label="Field sub-navigation">
          {resolvedTabs.map((tab) => {
            const className = `owner-page-header__tab-link ${
              tab.active ? 'owner-page-header__tab-link--active' : ''
            }`

            if (tab.to) {
              return (
                <Link key={tab.key} to={tab.to} className={className}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </Link>
              )
            }

            return (
              <button
                key={tab.key}
                type="button"
                className={className}
                onClick={tab.onClick}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </header>
  )
}

