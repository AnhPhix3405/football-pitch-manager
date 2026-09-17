import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from './auth.types'

interface AuthState { user: AuthUser | null }
export const authSessionKey = 'pitchmaster.authUser'

function restoreUser(): AuthUser | null {
  try {
    const stored = window.sessionStorage.getItem(authSessionKey)
    if (!stored) return null
    const value: unknown = JSON.parse(stored)
    if (typeof value !== 'object' || value === null) return null
    const candidate = value as Partial<AuthUser>
    const validRole = candidate.role === 'user' || candidate.role === 'owner' || candidate.role === 'admin'
    return typeof candidate.id === 'string' && typeof candidate.name === 'string' && typeof candidate.email === 'string' && validRole ? candidate as AuthUser : null
  } catch {
    return null
  }
}

const initialState: AuthState = { user: restoreUser() }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn: (state, action: PayloadAction<AuthUser>) => { state.user = action.payload },
    signedOut: (state) => { state.user = null },
  },
})

export const { signedIn, signedOut } = authSlice.actions
export const authReducer = authSlice.reducer
