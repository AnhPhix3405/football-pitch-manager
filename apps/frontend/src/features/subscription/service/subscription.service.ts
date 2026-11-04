import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  SubscribePlanPayload,
  SubscriptionPlan,
  UserSubscription,
} from '../interface/subscription.interface'

export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/subscription-plans')
  return response.data.data
}

export async function getMySubscription(): Promise<UserSubscription | null> {
  const response = await apiClient.get<ApiResponse<UserSubscription | null>>('/subscriptions/me')
  return response.data.data
}

export async function subscribePlan(payload: SubscribePlanPayload): Promise<UserSubscription> {
  const response = await apiClient.post<ApiResponse<UserSubscription>>('/subscriptions', payload)
  return response.data.data
}

export async function cancelSubscription(id: string): Promise<UserSubscription> {
  const response = await apiClient.delete<ApiResponse<UserSubscription>>(`/subscriptions/${id}`)
  return response.data.data
}

