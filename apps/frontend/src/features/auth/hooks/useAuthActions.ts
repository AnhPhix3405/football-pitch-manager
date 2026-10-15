import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../app/hooks'
import { signedIn } from '../auth.slice'
import { canRoleAccessPath, getRoleHome } from '../auth.routing'
import { login, loginGoogle, register } from '../service/auth.service'
import type { LoginCredentials, RegisterDetails } from '../interface/auth.types'

export function useAuthActions(mode: 'login' | 'register') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const navigateAfterAuth = (user: { role: 'user' | 'owner' | 'admin' }) => {
    const requestedPath =
      typeof location.state === 'object' &&
      location.state &&
      'from' in location.state &&
      typeof location.state.from === 'string'
        ? location.state.from
        : null
    const destination =
      requestedPath && canRoleAccessPath(user.role, requestedPath)
        ? requestedPath
        : getRoleHome(user.role)
    navigate(destination, { replace: true })
  }

  const submitAuth = async (values: RegisterDetails & { confirmPassword?: string }) => {
    setError(null)
    setLoading(true)
    try {
      const user =
        mode === 'login'
          ? await login(values as LoginCredentials)
          : await register(values)
      dispatch(signedIn(user))
      navigateAfterAuth(user)
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : 'Không thể kết nối. Vui lòng thử lại.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      setError('Không nhận được thông tin xác thực từ Google.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const user = await loginGoogle(credential)
      dispatch(signedIn(user))
      navigateAfterAuth(user)
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : 'Đăng nhập Google thất bại. Vui lòng thử lại.',
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    setError,
    submitAuth,
    handleGoogleSuccess,
  }
}
