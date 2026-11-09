export interface SubscriptionPlanBenefit {
  features?: string[]
  [key: string]: unknown
}

export interface AdminSubscriptionPlan {
  id: string
  name: string
  price: string | number
  durationDays: number
  benefit?: SubscriptionPlanBenefit | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateSubscriptionPlanPayload {
  name: string
  price: number
  durationDays: number
  benefit?: SubscriptionPlanBenefit
  isActive?: boolean
}

export interface UpdateSubscriptionPlanPayload {
  name?: string
  price?: number
  durationDays?: number
  benefit?: SubscriptionPlanBenefit
  isActive?: boolean
}

export type SubscriptionPlanStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

export interface SubscriptionPlanQueryParams {
  search?: string
  status?: SubscriptionPlanStatusFilter
  all?: boolean
}

export type SubscriptionPlanViewMode = 'grid' | 'table'

export interface SubscriptionKpiMetrics {
  total: number
  active: number
  inactive: number
  minPrice: number
  maxPrice: number
}
