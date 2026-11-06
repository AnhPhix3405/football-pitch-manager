import type {
  AdminPostStatusFilter,
  AdminReviewStatusFilter,
  AdminReviewTypeFilter,
  AdminUserRoleFilter,
  AdminUserStatusFilter,
  ManagementTab,
} from '../interface/admin-management.interface'

export const DEFAULT_ADMIN_MANAGEMENT_LIMIT = 10
export const ADMIN_SEARCH_DEBOUNCE_MS = 300

export const MANAGEMENT_TABS: readonly ManagementTab[] = [
  'users',
  'posts',
  'reviews',
] as const

export const USER_ROLE_FILTERS: readonly AdminUserRoleFilter[] = [
  'all',
  'user',
  'owner',
  'admin',
] as const

export const USER_STATUS_FILTERS: readonly AdminUserStatusFilter[] = [
  'all',
  'active',
  'suspended',
] as const

export const POST_STATUS_FILTERS: readonly AdminPostStatusFilter[] = [
  'all',
  'open',
  'matched',
  'closed',
] as const

export const REVIEW_STATUS_FILTERS: readonly AdminReviewStatusFilter[] = [
  'all',
  'pending',
  'resolved',
] as const

export const REVIEW_TYPE_FILTERS: readonly AdminReviewTypeFilter[] = [
  'all',
  'field',
  'user',
] as const
