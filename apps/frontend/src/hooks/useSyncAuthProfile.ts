import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { profileUpdated } from '../features/auth/auth.slice'
import { getUserProfile } from '../features/profile/service/profile.service'

/**
 * Hook to automatically synchronize the current user's profile
 * (such as avatarUrl and fullName) into Redux auth state when authenticated.
 */
export function useSyncAuthProfile() {
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const authUserId = authUser?.id
  const hasAvatarUrl = authUser?.avatarUrl !== undefined

  useEffect(() => {
    if (!authUserId || hasAvatarUrl) {
      return
    }

    let isMounted = true

    getUserProfile()
      .then((profile) => {
        if (!isMounted || !profile) return
        dispatch(
          profileUpdated({
            name: profile.fullName || undefined,
            avatarUrl: profile.avatarUrl ?? null,
          }),
        )
      })
      .catch(() => {
        // Silently catch errors if user is unauthenticated or network fails
      })

    return () => {
      isMounted = false
    }
  }, [authUserId, hasAvatarUrl, dispatch])
}
