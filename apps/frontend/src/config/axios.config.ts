import axios from 'axios'
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
