import { apiClient, type ApiResponse } from '../../../config/axios.config'

export interface BackendFieldItem {
  id: string
  imageUrl?: string | null
  images?: string[]
  ownerId: string
  name: string
  address: string
  district: string | null
  lat: number | null
  lng: number | null
  description: string | null
  status: string
  requireDeposit: boolean
  depositType: string | null
  depositValue: number | null
  createdAt: string
  updatedAt: string
}

export interface BackendFieldListResponse {
  items: BackendFieldItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetPublicFieldsParams {
  page?: number
  limit?: number
  search?: string
  district?: string
}

export async function getPublicFields(params?: GetPublicFieldsParams): Promise<BackendFieldListResponse> {
  const response = await apiClient.get<ApiResponse<BackendFieldListResponse>>('/fields', {
    params,
  })
  return response.data.data
}

export async function getPublicFieldDetail(id: string): Promise<BackendFieldItem> {
  const response = await apiClient.get<ApiResponse<BackendFieldItem>>(`/fields/${id}`)
  return response.data.data
}

export interface PublicFieldServiceItem {
  id: string
  fieldId: string
  name: string
  price: number
  unit: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getFieldServices(fieldId: string): Promise<PublicFieldServiceItem[]> {
  const response = await apiClient.get<ApiResponse<PublicFieldServiceItem[]>>(`/fields/${fieldId}/services`)
  return response.data.data
}
