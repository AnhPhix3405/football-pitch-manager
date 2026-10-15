import { AuditOutlined, BellOutlined, CalendarOutlined, CheckSquareOutlined, CreditCardOutlined, DashboardOutlined, DollarOutlined, HomeOutlined, MenuOutlined, MessageOutlined, SafetyCertificateOutlined, SettingOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Drawer } from 'antd'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AccountDropdown } from '../../components/AccountDropdown'
import { BrandMark } from '../../components/BrandMark'

const userNavItems = [
  { to: '/app', label: 'Tổng quan', icon: <HomeOutlined /> },
  { to: '/app/fields', label: 'Sân bóng', icon: <ShopOutlined /> },
  { to: '/app/bookings', label: 'Đặt sân', icon: <CalendarOutlined /> },
  { to: '/app/opponents', label: 'Tìm đối', icon: <TeamOutlined /> },
  { to: '/app/posts', label: 'Bài đăng', icon: <TeamOutlined /> },
  { to: '/app/messages', label: 'Tin nhắn', icon: <MessageOutlined /> },
  { to: '/app/settings', label: 'Cài đặt', icon: <SettingOutlined /> },
]

const ownerNavItems = [
  { to: '/owner', label: 'Tổng quan', icon: <HomeOutlined /> },
  { to: '/owner/fields', label: 'Sân của tôi', icon: <ShopOutlined /> },
  { to: '/owner/services', label: 'Dịch vụ & giá', icon: <DollarOutlined /> },
  { to: '/owner/bookings', label: 'Booking', icon: <CalendarOutlined /> },
  { to: '/owner/subscription', label: 'Gói & giao dịch', icon: <CreditCardOutlined /> },
  { to: '/app/messages', label: 'Tin nhắn', icon: <MessageOutlined /> },
]

const adminNavItems = [
  { to: '/admin', label: 'Command Center', icon: <DashboardOutlined /> },
  { to: '/admin/approvals', label: 'Phê duyệt', icon: <CheckSquareOutlined /> },
  { to: '/admin/management', label: 'Quản lý', icon: <SafetyCertificateOutlined /> },
  { to: '/admin/reports', label: 'Báo cáo & Audit', icon: <AuditOutlined /> },
]

function Navigation({ close, mode }: { close?: () => void; mode: 'user' | 'owner' | 'admin' }) {
  const navItems = mode === 'owner' ? ownerNavItems : mode === 'admin' ? adminNavItems : userNavItems
  return <nav className="dashboard-nav">{navItems.map((item) => <NavLink end={item.to === '/app'} key={item.to} to={item.to} onClick={close}>{item.icon}<span>{item.label}</span></NavLink>)}</nav>
}

export function DashboardLayout({ mode = 'user' }: { mode?: 'user' | 'owner' | 'admin' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandMark />
        <Navigation mode={mode} />
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-header">
          <Button className="mobile-menu" icon={<MenuOutlined />} onClick={() => setOpen(true)} aria-label="Mở điều hướng" />
          <span className="connection"><i /> HỆ THỐNG TRỰC TUYẾN</span>
          <div className="header-actions">
            <Button type="text" icon={<BellOutlined />} aria-label="Thông báo" />
            <AccountDropdown variant="header" placement="bottomRight" />
          </div>
        </header>
        <main className="dashboard-content"><Outlet /></main>
      </section>
      <Drawer title={<BrandMark />} placement="left" open={open} onClose={() => setOpen(false)}>
        <Navigation mode={mode} close={() => setOpen(false)} />
      </Drawer>
    </div>
  )
}

