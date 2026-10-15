import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { authSessionKey } from '../features/auth/auth.slice'

export const store = configureStore({ reducer: rootReducer })

store.subscribe(() => {
  const user = store.getState().auth.user
  if (user) {
    window.localStorage.setItem(authSessionKey, JSON.stringify(user))
    window.sessionStorage.setItem(authSessionKey, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(authSessionKey)
    window.sessionStorage.removeItem(authSessionKey)
  }
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
