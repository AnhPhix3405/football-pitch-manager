import { useEffect, useState } from 'react'
import { ArrowUpOutlined } from '@ant-design/icons'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AccountDropdown } from '../../components/AccountDropdown'
import { BrandMark } from '../../components/BrandMark'
import { LanguageSwitch } from '../../components/LanguageSwitch'
import { NotificationDropdown } from '../../features/notifications'
import { useSyncAuthProfile } from '../../hooks/useSyncAuthProfile'

export function PublicLayout() {
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  useSyncAuthProfile()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="public-layout">
      <header className={`public-header ${isScrolled ? 'public-header--scrolled' : ''}`}>
        <div className="public-header__left">
          <BrandMark />
        </div>

        <nav className="public-header__center" aria-label="Public navigation">
          <NavLink to="/" end>
            {t('nav.home', { defaultValue: 'Trang chủ' })}
          </NavLink>
          <NavLink to="/fields">
            {t('nav.findFields', { defaultValue: 'Sân bóng' })}
          </NavLink>
          <NavLink to="/opponents">
            {t('nav.opponents', { defaultValue: 'Tìm đối' })}
          </NavLink>
          <NavLink to="/bookings">
            {t('nav.myBookings', { defaultValue: 'Lịch đặt' })}
          </NavLink>
          <NavLink to="/messages">
            {t('nav.messages', { defaultValue: 'Tin nhắn' })}
          </NavLink>
        </nav>

        <div className="public-header__right">
          <LanguageSwitch />
          <NotificationDropdown />
          <AccountDropdown variant="header" placement="bottomRight" />
          <Link to="/fields" className="navbar-pill-cta">
            <span>{t('home.bookPitch', { defaultValue: 'Đặt sân ngay' })}</span>
            <span className="navbar-pill-cta__icon">
              <ArrowUpOutlined style={{ transform: 'rotate(45deg)' }} />
            </span>
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

