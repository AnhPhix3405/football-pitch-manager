export interface SubscriptionPlan {
  id: string
  name: string
  price: string
  durationDays: number
  benefit?: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserSubscription {
  id: string
  ownerId: string
  planId: string
  plan?: SubscriptionPlan
  status: 'pending_payment' | 'active' | 'expired' | 'cancelled'
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export interface SubscribePlanPayload {
  planId: string
}

