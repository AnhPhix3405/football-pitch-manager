import axios from 'axios'
import { env } from './env'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('pitchmaster.accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
