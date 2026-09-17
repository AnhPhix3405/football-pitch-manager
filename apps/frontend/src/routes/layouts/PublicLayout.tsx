import { Button } from 'antd'
import { NavLink, Outlet } from 'react-router-dom'
import { BrandMark } from '../../common/BrandMark'

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <BrandMark />
        <nav aria-label="Public navigation">
          <NavLink to="/fields">Tìm sân</NavLink>
          <NavLink to="/opponents">Tìm đối</NavLink>
          <NavLink to="/app/bookings">Lịch đặt</NavLink>
          <NavLink to="/auth/login"><Button type="primary">Đăng nhập</Button></NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
