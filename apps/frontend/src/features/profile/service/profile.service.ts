import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  UpdateUserLocationPayload,
  UpdateUserProfilePayload,
  UserProfile,
} from '../interface/profile.types'

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/user-profiles/me')
  return response.data.data
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfile> {
  const response = await apiClient.patch<ApiResponse<UserProfile>>('/user-profiles/me', payload)
  return response.data.data
}

export async function uploadAvatarApi(file: File): Promise<{ url: string; path: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ApiResponse<{ url: string; path: string }>>(
    '/upload/image?folder=avatars',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data.data
}

export async function updateUserLocationApi(
  payload: UpdateUserLocationPayload,
): Promise<UserProfile> {
  const response = await apiClient.patch<ApiResponse<UserProfile>>(
    '/user-profiles/me/location',
    payload,
  )
  return response.data.data
}

