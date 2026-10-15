import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type { BackendFieldItem, BackendFieldListResponse } from '../../fields/service/field.service'

export interface RegisterOwnerPayload {
  businessName: string
  businessLicense: string
  bankAccount: string
  note?: string
}

export interface OwnerRegistrationStatusResponse {
  hasRequest: boolean
  status?: 'pending' | 'approved' | 'rejected'
  submittedAt?: string
  reviewedAt?: string | null
  rejectionReason?: string | null
}

export interface OwnerProfileResponse {
  id: string
  userId: string
  businessName: string
  businessLicense: string
  bankAccount: string
  note?: string | null
}

export interface CreateFieldPayload {
  name: string
  address: string
  district?: string
  lat?: number
  lng?: number
  description?: string
  requireDeposit?: boolean
  depositType?: 'fixed' | 'percentage'
  depositValue?: number
}

export interface UpdateFieldPayload extends Partial<CreateFieldPayload> {
  status?: 'pending' | 'active' | 'inactive' | 'rejected'
}

export interface OwnerFieldQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

// 1. Đăng ký chủ sân & xem trạng thái
export async function registerOwner(payload: RegisterOwnerPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>('/owner-registration', payload)
}

export async function getRegistrationStatus(): Promise<OwnerRegistrationStatusResponse> {
  const response = await apiClient.get<ApiResponse<OwnerRegistrationStatusResponse>>('/owner-registration/status')
  return response.data.data
}

// 2. Hồ sơ chủ sân
export async function getMyProfile(): Promise<OwnerProfileResponse> {
  const response = await apiClient.get<ApiResponse<OwnerProfileResponse>>('/owner-profiles/me')
  return response.data.data
}

export async function updateMyProfile(payload: Partial<RegisterOwnerPayload>): Promise<OwnerProfileResponse> {
  const response = await apiClient.patch<ApiResponse<OwnerProfileResponse>>('/owner-profiles/me', payload)
  return response.data.data
}

// 3. Quản lý sân của chủ sân
export async function getOwnerFields(params?: OwnerFieldQueryParams): Promise<BackendFieldListResponse> {
  const response = await apiClient.get<ApiResponse<BackendFieldListResponse>>('/owner/fields', { params })
  return response.data.data
}

export async function getOwnerFieldDetail(id: string): Promise<BackendFieldItem> {
  const response = await apiClient.get<ApiResponse<BackendFieldItem>>(`/owner/fields/${id}`)
  return response.data.data
}

export async function createField(payload: CreateFieldPayload): Promise<BackendFieldItem> {
  const response = await apiClient.post<ApiResponse<BackendFieldItem>>('/owner/fields', payload)
  return response.data.data
}

export async function updateField(id: string, payload: UpdateFieldPayload): Promise<BackendFieldItem> {
  const response = await apiClient.patch<ApiResponse<BackendFieldItem>>(`/owner/fields/${id}`, payload)
  return response.data.data
}

export async function deactivateField(id: string): Promise<BackendFieldItem> {
  const response = await apiClient.delete<ApiResponse<BackendFieldItem>>(`/owner/fields/${id}`)
  return response.data.data
}
