import axios, { type InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import i18n from './i18n'

export const ACCESS_TOKEN_KEY = 'pitchmaster.accessToken'

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
  path?: string
  timestamp?: string
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const currentLanguage =
    i18n.resolvedLanguage ||
    i18n.language ||
    window.localStorage.getItem('i18nextLng') ||
    'vi'
  config.headers['Accept-Language'] = currentLanguage

  return config
})

interface QueueItem {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

function handleSessionExpired() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem('pitchmaster.authUser')
  window.sessionStorage.removeItem('pitchmaster.authUser')

  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/auth')
  ) {
    window.location.href = '/auth/login'
  }
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined
    const status = error.response?.status
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh')

    if (status === 401 && !isAuthEndpoint && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err: unknown) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post<{
          success: boolean
          data: { accessToken: string; user?: unknown }
        }>(
          `${env.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const newAccessToken = refreshResponse.data?.data?.accessToken
        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint')
        }

        window.localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return apiClient(originalRequest)
      } catch (refreshErr: unknown) {
        processQueue(refreshErr, null)
        handleSessionExpired()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401 && originalRequest?.url?.includes('/auth/refresh')) {
      handleSessionExpired()
    }

    const serverMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.error?.details)
        ? error.response.data.error.details.join(', ')
        : null)

    const message =
      serverMessage ||
      error.message ||
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.'

    return Promise.reject(new Error(message))
  },
)
