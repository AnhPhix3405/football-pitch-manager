import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  AdminApprovalQueryParams,
  AdminFieldApprovalItem,
  AdminOwnerApprovalItem,
  AdminOwnerApprovalListResponse,
  AdminTargetField,
  RequesterSummary,
  ReviewerSummary,
  TargetOwnerProfile,
} from '../interface/admin.interface'

export type {
  AdminApprovalQueryParams,
  AdminFieldApprovalItem,
  AdminOwnerApprovalItem,
  AdminOwnerApprovalListResponse,
  AdminTargetField,
  RequesterSummary,
  ReviewerSummary,
  TargetOwnerProfile,
}

export async function getOwnerApprovals(params?: AdminApprovalQueryParams): Promise<AdminOwnerApprovalListResponse> {
  const response = await apiClient.get<ApiResponse<AdminOwnerApprovalListResponse>>('/admin/owner-approvals', {
    params,
  })
  return response.data.data
}

export async function getOwnerApprovalDetail(id: string): Promise<AdminOwnerApprovalItem> {
  const response = await apiClient.get<ApiResponse<AdminOwnerApprovalItem>>(`/admin/owner-approvals/${id}`)
  return response.data.data
}

export async function approveOwnerRegistration(id: string, note?: string): Promise<AdminOwnerApprovalItem> {
  const response = await apiClient.post<ApiResponse<AdminOwnerApprovalItem>>(`/admin/owner-approvals/${id}/approve`, {
    note,
  })
  return response.data.data
}

export async function rejectOwnerRegistration(id: string, rejectionReason: string): Promise<AdminOwnerApprovalItem> {
  const response = await apiClient.post<ApiResponse<AdminOwnerApprovalItem>>(`/admin/owner-approvals/${id}/reject`, {
    rejectionReason,
  })
  return response.data.data
}

export interface AdminFieldApprovalListResponse {
  items: AdminFieldApprovalItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminFieldApprovalQueryParams {
  page?: number
  limit?: number
  status?: string
  type?: string
}

export async function getFieldApprovals(params?: AdminFieldApprovalQueryParams): Promise<AdminFieldApprovalListResponse> {
  const response = await apiClient.get<ApiResponse<AdminFieldApprovalListResponse>>('/admin/field-approvals', {
    params,
  })
  return response.data.data
}

export async function getFieldApprovalDetail(id: string): Promise<AdminFieldApprovalItem> {
  const response = await apiClient.get<ApiResponse<AdminFieldApprovalItem>>(`/admin/field-approvals/${id}`)
  return response.data.data
}

export async function approveFieldRequest(id: string, note?: string): Promise<AdminFieldApprovalItem> {
  const response = await apiClient.post<ApiResponse<AdminFieldApprovalItem>>(`/admin/field-approvals/${id}/approve`, {
    note,
  })
  return response.data.data
}

export async function rejectFieldRequest(id: string, reason: string): Promise<AdminFieldApprovalItem> {
  const response = await apiClient.post<ApiResponse<AdminFieldApprovalItem>>(`/admin/field-approvals/${id}/reject`, {
    reason,
  })
  return response.data.data
}
