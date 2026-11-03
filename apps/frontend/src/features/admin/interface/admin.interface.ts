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

export interface AdminTargetField {
  id: string
  name: string
  address: string
  ward?: string
  district?: string
  city?: string
  avatarUrl?: string | null
}

export interface AdminFieldApprovalItem {
  id: string
  type: 'field_create' | 'field_update' | string
  targetId: string
  status: 'pending' | 'approved' | 'rejected' | string
  note: string | null
  createdAt: string
  reviewedAt: string | null
  requester: RequesterSummary
  targetField?: AdminTargetField | null
  proposedChanges?: Record<string, unknown> | null
  reviewer?: ReviewerSummary | null
}
