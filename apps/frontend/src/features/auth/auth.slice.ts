import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from './interface/auth.types'

interface AuthState { user: AuthUser | null }
export const authSessionKey = 'pitchmaster.authUser'

function restoreUser(): AuthUser | null {
  try {
    const stored =
      window.localStorage.getItem(authSessionKey) ||
      window.sessionStorage.getItem(authSessionKey)
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
    profileUpdated: (
      state,
      action: PayloadAction<{ name?: string; avatarUrl?: string | null }>,
    ) => {
      if (state.user) {
        if (action.payload.name !== undefined) {
          state.user.name = action.payload.name
        }
        if (action.payload.avatarUrl !== undefined) {
          state.user.avatarUrl = action.payload.avatarUrl
        }
        try {
          const stored = window.localStorage.getItem(authSessionKey)
          if (stored) {
            window.localStorage.setItem(authSessionKey, JSON.stringify(state.user))
          } else {
            window.sessionStorage.setItem(authSessionKey, JSON.stringify(state.user))
          }
        } catch {
          // ignore
        }
      }
    },
  },
})

export const { signedIn, signedOut, profileUpdated } = authSlice.actions
export const authReducer = authSlice.reducer
