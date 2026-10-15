import { apiClient, type ApiResponse } from '../../../config/axios.config'

export interface RequesterSummary {
  id: string
  email: string
  phone: string | null
  role: string
  status: string
}

export interface TargetOwnerProfile {
  id: string
  businessName: string | null
  businessLicense: string | null
  bankAccount: string | null
  verifiedAt: string | null
}

export interface ReviewerSummary {
  id: string
  email: string
}

export interface AdminOwnerApprovalItem {
  id: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  createdAt: string
  reviewedAt: string | null
  requester: RequesterSummary
  ownerProfile?: TargetOwnerProfile | null
  reviewer?: ReviewerSummary | null
}

export interface AdminOwnerApprovalListResponse {
  items: AdminOwnerApprovalItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminApprovalQueryParams {
  page?: number
  limit?: number
  status?: string
  search?: string
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
