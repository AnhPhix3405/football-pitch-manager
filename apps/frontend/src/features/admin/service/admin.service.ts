import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  AdminAuditItem,
  AdminAuditListResponse,
  AdminAuditQueryParams,
  AdminModerationReportItem,
  AdminModerationReportsQueryParams,
  AdminModerationReportsResponse,
  AdminSystemStatusResponse,
} from '../interface/admin-reports.interface'
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
import type {
  AdminOverviewData,
  AdminOverviewQueryParams,
} from '../interface/admin-overview.interface'
import type {
  AdminDeletePostResponse,
  AdminPostItem,
  AdminPostsListResponse,
  AdminPostsQueryParams,
  AdminReviewItem,
  AdminReviewsListResponse,
  AdminReviewsQueryParams,
  AdminReviewType,
  AdminUserDetail,
  AdminUserItem,
  AdminUsersListResponse,
  AdminUsersQueryParams,
  ModerateReviewPayload,
  UpdateUserStatusPayload,
} from '../interface/admin-management.interface'

export type {
  AdminApprovalQueryParams,
  AdminDeletePostResponse,
  AdminFieldApprovalItem,
  AdminOverviewData,
  AdminOverviewQueryParams,
  AdminOwnerApprovalItem,
  AdminOwnerApprovalListResponse,
  AdminPostItem,
  AdminPostsListResponse,
  AdminPostsQueryParams,
  AdminReviewItem,
  AdminReviewsListResponse,
  AdminReviewsQueryParams,
  AdminTargetField,
  AdminUserDetail,
  AdminUserItem,
  AdminUsersListResponse,
  AdminUsersQueryParams,
  ModerateReviewPayload,
  RequesterSummary,
  ReviewerSummary,
  TargetOwnerProfile,
  UpdateUserStatusPayload,
}

export async function getAdminOverview(
  params?: AdminOverviewQueryParams,
): Promise<AdminOverviewData> {
  const response = await apiClient.get<ApiResponse<AdminOverviewData>>(
    '/admin/overview',
    { params },
  )
  return response.data.data
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
  search?: string
  fromDate?: string
  toDate?: string
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

export async function getAdminUsers(
  params?: AdminUsersQueryParams,
): Promise<AdminUsersListResponse> {
  const response = await apiClient.get<ApiResponse<AdminUsersListResponse>>(
    '/admin/users',
    { params },
  )
  return response.data.data
}

export async function getAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail> {
  const response = await apiClient.get<ApiResponse<AdminUserDetail>>(
    `/admin/users/${userId}`,
  )
  return response.data.data
}

export async function updateAdminUserStatus(
  userId: string,
  payload: UpdateUserStatusPayload,
): Promise<AdminUserItem> {
  const response = await apiClient.patch<ApiResponse<AdminUserItem>>(
    `/admin/users/${userId}/status`,
    payload,
  )
  return response.data.data
}

export async function getAdminPosts(
  params?: AdminPostsQueryParams,
): Promise<AdminPostsListResponse> {
  const response = await apiClient.get<ApiResponse<AdminPostsListResponse>>(
    '/admin/posts',
    { params },
  )
  return response.data.data
}

export async function deleteAdminPost(
  postId: string,
): Promise<AdminDeletePostResponse> {
  const response = await apiClient.delete<ApiResponse<AdminDeletePostResponse>>(
    `/admin/posts/${postId}`,
  )
  return response.data.data
}

export async function getAdminReviews(
  params?: AdminReviewsQueryParams,
): Promise<AdminReviewsListResponse> {
  const response = await apiClient.get<ApiResponse<AdminReviewsListResponse>>(
    '/admin/reviews',
    { params },
  )
  return response.data.data
}

export async function moderateAdminReview(
  reviewType: AdminReviewType,
  reviewId: string,
  payload: ModerateReviewPayload,
): Promise<unknown> {
  const endpoint =
    reviewType === 'field'
      ? `/reviews/fields/${reviewId}/moderate`
      : `/reviews/users/${reviewId}/moderate`
  const response = await apiClient.patch<ApiResponse<unknown>>(
    endpoint,
    payload,
  )
  return response.data.data
}

export async function getAdminAuditLogs(
  params?: AdminAuditQueryParams,
): Promise<AdminAuditListResponse> {
  const response = await apiClient.get<ApiResponse<AdminAuditListResponse>>(
    '/admin/audit-logs',
    { params },
  )
  return response.data.data
}

export async function getAdminAuditLogById(
  id: string,
): Promise<AdminAuditItem> {
  const response = await apiClient.get<ApiResponse<AdminAuditItem>>(
    `/admin/audit-logs/${id}`,
  )
  return response.data.data
}

export async function exportAdminAuditLogs(
  params?: AdminAuditQueryParams,
  format: 'json' | 'csv' = 'json',
): Promise<{ data: string; contentType: string; filename: string }> {
  const response = await apiClient.get<string>('/admin/audit-logs/export', {
    params: { ...params, format },
    responseType: 'text',
  })
  const contentType =
    format === 'csv'
      ? 'text/csv; charset=utf-8'
      : 'application/json; charset=utf-8'
  const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `audit-logs-${dateSuffix}.${format}`
  return { data: response.data, contentType, filename }
}

export async function getAdminModerationReports(
  params?: AdminModerationReportsQueryParams,
): Promise<AdminModerationReportsResponse> {
  const response = await apiClient.get<
    ApiResponse<AdminModerationReportsResponse>
  >('/admin/reports/moderation', { params })
  return response.data.data
}

export async function getAdminModerationReportById(
  id: string,
): Promise<AdminModerationReportItem> {
  const response = await apiClient.get<
    ApiResponse<AdminModerationReportItem>
  >(`/admin/reports/moderation/${id}`)
  return response.data.data
}

export async function getAdminSystemStatus(): Promise<AdminSystemStatusResponse> {
  const response = await apiClient.get<ApiResponse<AdminSystemStatusResponse>>(
    '/admin/reports/system-status',
  )
  return response.data.data
}
