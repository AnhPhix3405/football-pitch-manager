import { NavLink, Outlet } from 'react-router-dom'
import { AccountDropdown } from '../../components/AccountDropdown'
import { BrandMark } from '../../components/BrandMark'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <BrandMark />
        <nav aria-label="Public navigation">
          <NavLink to="/app/fields">Tìm sân</NavLink>
          <NavLink to="/app/opponents">Tìm đối</NavLink>
          <NavLink to="/app/bookings">Lịch đặt</NavLink>
          <AccountDropdown variant="header" placement="bottomRight" />
        </nav>
      </header>
      <Outlet />
    </div>
  )
}

