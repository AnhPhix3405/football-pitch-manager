export type AdminOverviewDayRange = 7 | 14 | 30

export type AdminActivityMetricMode = 'bookings' | 'gmv' | 'users'

export type AdminPriorityQueueCategory =
  | 'OWNER_APPROVAL'
  | 'FIELD_APPROVAL'
  | 'REVIEW_REPORT'

export interface AdminOverviewQueryParams {
  days?: number
  queueLimit?: number
  auditLimit?: number
}

export interface AdminRoleDistribution {
  user: number
  owner: number
  admin: number
}

export interface AdminUsersMetric {
  total: number
  newThisMonth: number
  previousMonth: number
  growthPercent: number
  byRole: AdminRoleDistribution
}

export interface AdminFieldsMetric {
  active: number
  total: number
  pending: number
  newThisMonth: number
}

export interface AdminGmvMetric {
  currentMonthGmv: number
  previousMonthGmv: number
  growthPercent: number
  totalPaidRevenue: number
}

export interface AdminQueueMetric {
  totalPending: number
  pendingOwnerApprovals: number
  pendingFieldApprovals: number
  flaggedReviews: number
}

export interface AdminOverviewMetrics {
  users: AdminUsersMetric
  fields: AdminFieldsMetric
  gmv: AdminGmvMetric
  queue: AdminQueueMetric
}

export interface AdminActivityPoint {
  date: string
  bookingsCount: number
  gmv: number
  newUsersCount: number
}

export interface AdminActivityBarItem extends AdminActivityPoint {
  heightPercent: number
  displayValue: string
  shortDateLabel: string
}

export interface AdminServiceHealthItem {
  name: string
  status: 'up' | 'degraded' | 'down'
  score: number
  latencyMs: number
}

export interface AdminSystemHealth {
  status: 'operational' | 'degraded'
  uptimeSeconds: number
  services: AdminServiceHealthItem[]
}

export interface AdminPriorityQueueItem {
  id: string
  category: AdminPriorityQueueCategory
  subType: string
  title: string
  requesterEmail: string
  status: string
  createdAt: string
}

export interface AdminAuditItem {
  id: string
  action: string
  actor: string
  target: string
  timestamp: string
}

export interface AdminOverviewData {
  metrics: AdminOverviewMetrics
  activityTimeline: AdminActivityPoint[]
  systemHealth: AdminSystemHealth
  priorityQueue: AdminPriorityQueueItem[]
  recentAudits: AdminAuditItem[]
}
