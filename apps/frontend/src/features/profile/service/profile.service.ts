import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type { UpdateUserProfilePayload, UserProfile } from '../interface/profile.types'

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/user-profiles/me')
  return response.data.data
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfile> {
  const response = await apiClient.patch<ApiResponse<UserProfile>>('/user-profiles/me', payload)
  return response.data.data
}
