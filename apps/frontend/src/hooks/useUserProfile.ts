import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { profileUpdated } from '../features/auth/auth.slice'
import type {
  UpdateUserProfilePayload,
  UserProfile,
} from '../features/profile/interface/profile.types'
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatarApi,
  updateUserLocationApi,
} from '../features/profile/service/profile.service'
import { compressAvatar } from '../utils/image-compressor.utils'

export function useUserProfile() {
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [updatingLocation, setUpdatingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authUserId = authUser?.id

  const fetchProfile = useCallback(async () => {
    if (!authUserId) {
      setProfile(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getUserProfile()
      setProfile(data)
      dispatch(
        profileUpdated({
          name: data.fullName || undefined,
          avatarUrl: data.avatarUrl ?? null,
        }),
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch user profile'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [authUserId, dispatch])

  useEffect(() => {
    let cancelled = false
    if (!authUserId) {
      setProfile(null)
      return
    }

    setLoading(true)
    setError(null)
    getUserProfile()
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        dispatch(
          profileUpdated({
            name: data.fullName || undefined,
            avatarUrl: data.avatarUrl ?? null,
          }),
        )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'Failed to fetch user profile'
        setError(msg)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authUserId, dispatch])

  const handleUpdateProfile = useCallback(
    async (payload: UpdateUserProfilePayload): Promise<UserProfile> => {
      setUpdating(true)
      setError(null)
      try {
        const updated = await updateUserProfile(payload)
        setProfile(updated)
        dispatch(
          profileUpdated({
            name: updated.fullName || undefined,
            avatarUrl: updated.avatarUrl !== undefined ? updated.avatarUrl : undefined,
          }),
        )
        return updated
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update user profile'
        setError(msg)
        throw err
      } finally {
        setUpdating(false)
      }
    },
    [dispatch],
  )

  const handleUploadAvatar = useCallback(
    async (file: File): Promise<UserProfile> => {
      setUploadingAvatar(true)
      setError(null)
      try {
        let processedFile = file
        try {
          processedFile = await compressAvatar(file)
        } catch {
          processedFile = file
        }
        const uploaded = await uploadAvatarApi(processedFile)
        const updated = await updateUserProfile({ avatarUrl: uploaded.url })
        setProfile(updated)
        dispatch(profileUpdated({ avatarUrl: updated.avatarUrl }))
        return updated
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to upload avatar'
        setError(msg)
        throw err
      } finally {
        setUploadingAvatar(false)
      }
    },
    [dispatch],
  )

  const handleUpdateLocation = useCallback(
    async (lat: number, lng: number): Promise<UserProfile> => {
      setUpdatingLocation(true)
      setError(null)
      try {
        const updated = await updateUserLocationApi({ lat, lng })
        setProfile(updated)
        return updated
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update user location'
        setError(msg)
        throw err
      } finally {
        setUpdatingLocation(false)
      }
    },
    [],
  )

  return {
    profile,
    loading,
    updating,
    uploadingAvatar,
    updatingLocation,
    error,
    refetch: fetchProfile,
    updateProfile: handleUpdateProfile,
    uploadAvatar: handleUploadAvatar,
    updateLocation: handleUpdateLocation,
  }
}

