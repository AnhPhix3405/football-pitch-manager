import {
  AuditOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DollarOutlined,
  HomeOutlined,
  MenuOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Button, Drawer } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import { AccountDropdown } from '../../components/AccountDropdown'
import { BrandMark } from '../../components/BrandMark'
import { LanguageSwitch } from '../../components/LanguageSwitch'
import { NotificationDropdown } from '../../features/notifications'
import { useSyncAuthProfile } from '../../hooks/useSyncAuthProfile'

function Navigation({ close, mode }: { close?: () => void; mode: 'user' | 'owner' | 'admin' }) {
  const { t } = useTranslation()

  const userNavItems = [
    { to: '/app', label: t('nav.home', { defaultValue: 'Tổng quan' }), icon: <HomeOutlined /> },
    { to: '/app/fields', label: t('nav.fields', { defaultValue: 'Sân bóng' }), icon: <ShopOutlined /> },
    { to: '/app/bookings', label: t('nav.bookings', { defaultValue: 'Đặt sân' }), icon: <CalendarOutlined /> },
    { to: '/app/opponents', label: t('nav.opponents', { defaultValue: 'Tìm đối' }), icon: <TeamOutlined /> },
    { to: '/app/posts', label: t('nav.posts', { defaultValue: 'Bài đăng' }), icon: <TeamOutlined /> },
    { to: '/app/messages', label: t('nav.messages', { defaultValue: 'Tin nhắn' }), icon: <MessageOutlined /> },
    { to: '/app/settings', label: t('nav.settings', { defaultValue: 'Cài đặt' }), icon: <SettingOutlined /> },
  ]

  const ownerNavItems = [
    { to: '/owner', label: t('nav.home', { defaultValue: 'Tổng quan' }), icon: <HomeOutlined /> },
    { to: '/owner/fields', label: t('nav.myFields', { defaultValue: 'Sân của tôi' }), icon: <ShopOutlined /> },
    { to: '/owner/services', label: t('nav.services', { defaultValue: 'Dịch vụ & giá' }), icon: <DollarOutlined /> },
    { to: '/owner/bookings', label: t('nav.bookings', { defaultValue: 'Booking' }), icon: <CalendarOutlined /> },
    { to: '/owner/subscription', label: t('nav.subscription', { defaultValue: 'Gói & giao dịch' }), icon: <CreditCardOutlined /> },
    { to: '/messages', label: t('nav.messages', { defaultValue: 'Tin nhắn' }), icon: <MessageOutlined /> },
  ]

  const adminNavItems = [
    { to: '/admin', label: t('nav.commandCenter', { defaultValue: 'Command Center' }), icon: <DashboardOutlined /> },
    { to: '/admin/approvals', label: t('nav.approvals', { defaultValue: 'Phê duyệt' }), icon: <CheckSquareOutlined /> },
    { to: '/admin/management', label: t('nav.management', { defaultValue: 'Quản lý' }), icon: <SafetyCertificateOutlined /> },
    { to: '/admin/reports', label: t('nav.reports', { defaultValue: 'Báo cáo & Audit' }), icon: <AuditOutlined /> },
  ]

  const navItems = mode === 'owner' ? ownerNavItems : mode === 'admin' ? adminNavItems : userNavItems

  return (
    <nav className="dashboard-nav">
      {navItems.map((item) => (
        <NavLink end={item.to === '/app'} key={item.to} to={item.to} onClick={close}>
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function DashboardLayout({ mode = 'user' }: { mode?: 'user' | 'owner' | 'admin' }) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  useSyncAuthProfile()

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandMark />
        <Navigation mode={mode} />
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-header">
          <Button
            className="mobile-menu"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            aria-label="Mở điều hướng"
          />
          <span className="connection">
            <i /> {t('common.online')}
          </span>
          <div className="header-actions">
            <LanguageSwitch />
            <NotificationDropdown />
            <AccountDropdown variant="header" placement="bottomRight" />
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </section>
      <Drawer title={<BrandMark />} placement="left" open={open} onClose={() => setOpen(false)}>
        <Navigation mode={mode} close={() => setOpen(false)} />
      </Drawer>
    </div>
  )
}
