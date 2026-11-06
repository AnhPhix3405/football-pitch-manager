export type ManagementTab = 'users' | 'posts' | 'reviews'

export type AdminUserRole = 'user' | 'owner' | 'admin'
export type AdminUserRoleFilter = 'all' | AdminUserRole

export type AdminUserStatus =
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'pending_verification'
export type AdminUserStatusFilter = 'all' | AdminUserStatus
export type AdminMutableUserStatus = 'active' | 'suspended'

export type AdminPostStatus = 'open' | 'matched' | 'closed'
export type AdminPostStatusFilter = 'all' | AdminPostStatus

export type AdminReviewType = 'field' | 'user'
export type AdminReviewTypeFilter = 'all' | AdminReviewType

export type AdminReviewModerationStatus = 'pending' | 'resolved'
export type AdminReviewStatusFilter = 'all' | AdminReviewModerationStatus

export interface AdminPaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminUserItem {
  id: string
  fullName: string
  email: string
  phone: string | null
  avatarUrl: string | null
  role: AdminUserRole
  status: AdminUserStatus
  reportsCount: number
  createdAt: string
}

export interface AdminUsersSummary {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  flaggedUsers: number
}

export interface AdminUsersListResponse {
  items: AdminUserItem[]
  meta: AdminPaginationMeta
  summary: AdminUsersSummary
}

export interface AdminUserStats {
  bookingsCount: number
  fieldsCount: number
  postsCount: number
}

export interface AdminUserDetail extends AdminUserItem {
  bio: string | null
  skillLevel: string | null
  preferredPositions: string[]
  reliabilityScore: number
  stats: AdminUserStats
  updatedAt: string
}

export interface AdminUsersQueryParams {
  search?: string
  role?: AdminUserRoleFilter
  status?: AdminUserStatusFilter
  page?: number
  limit?: number
}

export interface UpdateUserStatusPayload {
  status: AdminMutableUserStatus
  reason?: string
}

export interface AdminPostItem {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorEmail: string
  fieldId: string | null
  fieldName: string | null
  playDate: string
  startTime: string
  endTime: string
  skillLevelRequired: string | null
  maxPlayers: number | null
  currentPlayers: number
  commentsCount: number
  status: AdminPostStatus
  createdAt: string
}

export interface AdminPostsSummary {
  totalPosts: number
  openPosts: number
  matchedPosts: number
  closedPosts: number
}

export interface AdminPostsListResponse {
  items: AdminPostItem[]
  meta: AdminPaginationMeta
  summary: AdminPostsSummary
}

export interface AdminPostsQueryParams {
  search?: string
  status?: AdminPostStatusFilter
  page?: number
  limit?: number
}

export interface AdminDeletePostResponse {
  id: string
  status: 'closed'
  deletedAt: string
}

export interface AdminReviewItem {
  id: string
  reviewType: AdminReviewType
  rating: number
  comment: string
  authorId: string
  authorName: string
  authorEmail: string
  targetId: string
  targetName: string
  isFlagged: boolean
  flagReason: string | null
  moderationStatus: AdminReviewModerationStatus
  createdAt: string
}

export interface AdminReviewsSummary {
  totalFlagged: number
  pendingCount: number
  resolvedCount: number
}

export interface AdminReviewsListResponse {
  items: AdminReviewItem[]
  meta: AdminPaginationMeta
  summary: AdminReviewsSummary
}

export interface AdminReviewsQueryParams {
  search?: string
  status?: AdminReviewStatusFilter
  reviewType?: AdminReviewTypeFilter
  page?: number
  limit?: number
}

export interface ModerateReviewPayload {
  action: 'hide' | 'dismiss'
  reason?: string
}
