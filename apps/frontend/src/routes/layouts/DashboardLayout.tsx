import {
  BarChartOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  DollarOutlined,
  HomeOutlined,
  MenuOutlined,
  MessageOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Badge, Button, Drawer } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import { AccountDropdown } from '../../components/AccountDropdown'
import { BrandMark } from '../../components/BrandMark'
import { LanguageSwitch } from '../../components/LanguageSwitch'
import { NotificationDropdown } from '../../features/notifications'
import { useAdminQueueCounts } from '../../hooks/useAdminQueueCounts'
import { useSyncAuthProfile } from '../../hooks/useSyncAuthProfile'
import { DashboardBreadcrumbs } from './components/DashboardBreadcrumbs'

interface NavItemConfig {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface NavSectionConfig {
  title?: string
  items: NavItemConfig[]
}

function Navigation({
  close,
  mode,
}: {
  close?: () => void
  mode: 'user' | 'owner' | 'admin'
}) {
  const { t } = useTranslation()
  const queueCounts = useAdminQueueCounts(mode === 'admin')

  const adminSections: NavSectionConfig[] = [
    {
      title: t('nav.sectionOverview', { defaultValue: 'TỔNG QUAN' }),
      items: [
        {
          to: '/admin',
          label: t('nav.dashboard', { defaultValue: 'Tổng quan' }),
          icon: <HomeOutlined />,
        },
      ],
    },
    {
      title: t('nav.sectionApprovals', { defaultValue: 'KIỂM DUYỆT' }),
      items: [
        {
          to: '/admin/approvals/owners',
          label: t('nav.ownerApprovals', { defaultValue: 'Duyệt chủ sân' }),
          icon: <CheckSquareOutlined />,
          badge: queueCounts.pendingOwners > 0 ? queueCounts.pendingOwners : undefined,
        },
        {
          to: '/admin/approvals/fields',
          label: t('nav.fieldApprovals', { defaultValue: 'Duyệt sân bóng' }),
          icon: <ShopOutlined />,
          badge: queueCounts.pendingFields > 0 ? queueCounts.pendingFields : undefined,
        },
      ],
    },
    {
      title: t('nav.sectionGovernance', { defaultValue: 'QUẢN TRỊ & BÁO CÁO' }),
      items: [
        {
          to: '/admin/fields',
          label: t('nav.allFields', { defaultValue: 'Sân bóng hệ thống' }),
          icon: <ShopOutlined />,
        },
        {
          to: '/admin/management',
          label: t('nav.management', { defaultValue: 'Quản lý & Kiểm duyệt' }),
          icon: <TeamOutlined />,
          badge: queueCounts.flaggedReviews > 0 ? queueCounts.flaggedReviews : undefined,
        },
        {
          to: '/admin/reports',
          label: t('nav.reports', { defaultValue: 'Báo cáo & Giám sát' }),
          icon: <BarChartOutlined />,
        },
      ],
    },
  ]

  const ownerSections: NavSectionConfig[] = [
    {
      items: [
        { to: '/owner', label: t('nav.home', { defaultValue: 'Tổng quan' }), icon: <HomeOutlined /> },
        { to: '/owner/fields', label: t('nav.myFields', { defaultValue: 'Sân của tôi' }), icon: <ShopOutlined /> },
        { to: '/owner/services', label: t('nav.services', { defaultValue: 'Dịch vụ & giá' }), icon: <DollarOutlined /> },
        { to: '/owner/bookings', label: t('nav.bookings', { defaultValue: 'Booking' }), icon: <CalendarOutlined /> },
        { to: '/owner/timeline', label: t('nav.timeline', { defaultValue: 'Lịch vận hành' }), icon: <ClockCircleOutlined /> },
        { to: '/owner/subscription', label: t('nav.subscription', { defaultValue: 'Gói & giao dịch' }), icon: <CreditCardOutlined /> },
        { to: '/messages', label: t('nav.messages', { defaultValue: 'Tin nhắn' }), icon: <MessageOutlined /> },
      ],
    },
  ]

  const userSections: NavSectionConfig[] = [
    {
      items: [
        { to: '/app', label: t('nav.home', { defaultValue: 'Tổng quan' }), icon: <HomeOutlined /> },
        { to: '/app/fields', label: t('nav.fields', { defaultValue: 'Sân bóng' }), icon: <ShopOutlined /> },
        { to: '/app/bookings', label: t('nav.bookings', { defaultValue: 'Đặt sân' }), icon: <CalendarOutlined /> },
        { to: '/app/opponents', label: t('nav.opponents', { defaultValue: 'Tìm đối' }), icon: <TeamOutlined /> },
        { to: '/app/posts', label: t('nav.posts', { defaultValue: 'Bài đăng' }), icon: <TeamOutlined /> },
        { to: '/app/messages', label: t('nav.messages', { defaultValue: 'Tin nhắn' }), icon: <MessageOutlined /> },
        { to: '/app/settings', label: t('nav.settings', { defaultValue: 'Cài đặt' }), icon: <SettingOutlined /> },
      ],
    },
  ]

  const sections = mode === 'owner' ? ownerSections : mode === 'admin' ? adminSections : userSections

  return (
    <nav className="dashboard-nav" aria-label="Sidebar Navigation">
      {sections.map((section, sIndex) => (
        <div key={section.title || `section-${sIndex}`} className="dashboard-nav__section">
          {section.title && (
            <h4 className="dashboard-nav__section-title">{section.title}</h4>
          )}
          <div className="dashboard-nav__list">
            {section.items.map((item) => (
              <NavLink
                end={item.to === '/app' || item.to === '/owner' || item.to === '/admin'}
                key={item.to}
                to={item.to}
                onClick={close}
                className={({ isActive }) =>
                  `dashboard-nav__item ${isActive ? 'dashboard-nav__item--active' : ''}`
                }
              >
                <span className="dashboard-nav__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="dashboard-nav__label">{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <Badge
                    count={item.badge}
                    size="small"
                    className="dashboard-nav__badge"
                  />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function DashboardLayout({ mode = 'user' }: { mode?: 'user' | 'owner' | 'admin' }) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  useSyncAuthProfile()

  const brandDestination = mode === 'admin' ? '/admin' : mode === 'owner' ? '/owner' : '/app'

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <BrandMark to={brandDestination} />
          {mode === 'admin' && (
            <span className="admin-portal-badge">
              <span className="admin-portal-badge__dot" aria-hidden="true" />
              ADMIN
            </span>
          )}
        </div>

        <Navigation mode={mode} />
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header__left">
            <Button
              className="mobile-menu"
              icon={<MenuOutlined />}
              onClick={() => setOpen(true)}
              aria-label="Mở điều hướng"
            />
            <DashboardBreadcrumbs mode={mode} />
          </div>

          <div className="header-actions">
            {mode === 'admin' && (
              <div
                className="admin-status-indicator"
                title={t('nav.operational', { defaultValue: 'SYSTEM OPERATIONAL' })}
                aria-label={t('nav.operational', { defaultValue: 'SYSTEM OPERATIONAL' })}
              >
                <span className="admin-status-indicator__dot" />
                <span className="admin-status-indicator__text">
                  {t('nav.operational', { defaultValue: 'SYSTEM OPERATIONAL' })}
                </span>
              </div>
            )}
            <LanguageSwitch />
            <NotificationDropdown />
            <AccountDropdown variant="header" placement="bottomRight" />
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </section>

      <Drawer
        title={
          <div className="dashboard-sidebar__brand">
            <BrandMark to={brandDestination} />
            {mode === 'admin' && (
              <span className="admin-portal-badge">
                <span className="admin-portal-badge__dot" aria-hidden="true" />
                ADMIN
              </span>
            )}
          </div>
        }
        placement="left"
        open={open}
        onClose={() => setOpen(false)}
        className="dashboard-drawer"
      >
        <div className="dashboard-drawer__inner">
          <Navigation mode={mode} close={() => setOpen(false)} />
          <div className="dashboard-sidebar__footer">
            <AccountDropdown variant="sidebar" placement="topLeft" showName />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
