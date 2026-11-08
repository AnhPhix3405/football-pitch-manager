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

export async function searchAddressNominatim(
  query: string,
): Promise<Array<{ label: string; value: string; lat: number; lng: number }>> {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2) return []

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', trimmed)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', '5')
    url.searchParams.set('countrycodes', 'vn')

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = (await res.json()) as Array<{
      display_name: string
      lat: string
      lon: string
    }>

    return data.map((item) => ({
      label: item.display_name,
      value: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }))
  } catch {
    return []
  }
}

export async function reverseGeocodeCoords(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('lat', lat.toString())
    url.searchParams.set('lon', lng.toString())
    url.searchParams.set('format', 'json')

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    const data = (await res.json()) as { display_name?: string }
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

