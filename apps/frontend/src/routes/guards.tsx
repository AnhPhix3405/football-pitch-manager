import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import type { UserRole } from '../constants/role.constant'
import { getRoleHome } from '../features/auth/auth.routing'

export function ProtectedRoute() {
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()
  return user ? <Outlet /> : <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
}

export function RoleRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to={getRoleHome(user.role)} replace />
}
