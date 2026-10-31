import { ACCESS_TOKEN_KEY, apiClient, type ApiResponse } from '../../../config/axios.config'
import type { UserRole } from '../../../constants/role.constant'
import { disconnectChatSocket } from '../../chat/service/chat-socket.service'
import type { AuthUser, LoginCredentials, RegisterDetails } from '../interface/auth.types'

interface BackendUser {
  id: string
  email: string
  role: string
  status: string
  authProvider?: string
  phone?: string
  fullName?: string
}

interface LoginResponseData {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: BackendUser
}

interface RegisterResponseData {
  user: BackendUser
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', {
    email: credentials.email.trim(),
    password: credentials.password,
  })

  disconnectChatSocket()
  const { accessToken, user } = response.data.data
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

  return {
    id: user.id,
    name: user.fullName || credentials.email.split('@')[0] || 'Cầu thủ',
    email: user.email,
    role: (user.role as UserRole) || 'user',
  }
}

export async function register(details: RegisterDetails): Promise<AuthUser> {
  await apiClient.post<ApiResponse<RegisterResponseData>>('/auth/register', {
    email: details.email.trim(),
    password: details.password,
    fullName: details.name.trim(),
    phone: details.phone?.trim() || undefined,
  })

  return login({
    email: details.email,
    password: details.password,
    remember: true,
  })
}

export async function loginGoogle(idToken: string): Promise<AuthUser> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/google', {
    idToken,
  })

  disconnectChatSocket()
  const { accessToken, user } = response.data.data
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

  return {
    id: user.id,
    name: user.fullName || user.email.split('@')[0],
    email: user.email,
    role: (user.role as UserRole) || 'user',
  }
}

export async function refreshTokenApi(): Promise<string> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/refresh')
  const { accessToken, user } = response.data.data
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (user) {
    const authUser: AuthUser = {
      id: user.id,
      name: user.fullName || user.email.split('@')[0],
      email: user.email,
      role: (user.role as UserRole) || 'user',
    }
    const sessionKey = 'pitchmaster.authUser'
    if (window.localStorage.getItem(sessionKey)) {
      window.localStorage.setItem(sessionKey, JSON.stringify(authUser))
    } else {
      window.sessionStorage.setItem(sessionKey, JSON.stringify(authUser))
    }
  }
  return accessToken
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } catch {
    // Vẫn dọn dẹp local token nếu backend trả lỗi
  } finally {
    disconnectChatSocket()
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem('pitchmaster.authUser')
    window.sessionStorage.removeItem('pitchmaster.authUser')
  }
}
