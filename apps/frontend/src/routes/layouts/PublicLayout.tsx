import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AccountDropdown } from '../../components/AccountDropdown'
import { BrandMark } from '../../components/BrandMark'
import { LanguageSwitch } from '../../components/LanguageSwitch'

export function PublicLayout() {
  const { t } = useTranslation()

  return (
    <div className="public-layout">
      <header className="public-header">
        <BrandMark />
        <nav aria-label="Public navigation">
          <NavLink to="/app/fields">{t('nav.findFields', { defaultValue: 'Tìm sân' })}</NavLink>
          <NavLink to="/app/opponents">{t('nav.opponents', { defaultValue: 'Tìm đối' })}</NavLink>
          <NavLink to="/app/bookings">{t('nav.myBookings', { defaultValue: 'Lịch đặt' })}</NavLink>
          <LanguageSwitch />
          <AccountDropdown variant="header" placement="bottomRight" />
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
