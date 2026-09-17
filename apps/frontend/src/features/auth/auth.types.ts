import type { UserRole } from '../../constants/role.constant'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface RegisterDetails extends LoginCredentials {
  name: string
}
