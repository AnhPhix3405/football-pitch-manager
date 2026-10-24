import type { UserRole } from '../../constants/role.constant'

export function getRoleHome(role: UserRole) {
  if (role === 'admin') return '/admin'
  if (role === 'owner') return '/owner'
  return '/fields'
}

export function canRoleAccessPath(role: UserRole, path: string) {
  if (role === 'admin') return path === '/admin' || path.startsWith('/admin/')
  if (role === 'owner') return path === '/owner' || path.startsWith('/owner/')
  return !path.startsWith('/admin') && !path.startsWith('/owner')
}
