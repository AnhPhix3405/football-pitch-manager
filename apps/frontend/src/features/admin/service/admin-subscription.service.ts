import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  AdminSubscriptionPlan,
  CreateSubscriptionPlanPayload,
  SubscriptionPlanQueryParams,
  UpdateSubscriptionPlanPayload,
} from '../interface/admin-subscription.interface'

export const adminSubscriptionService = {
  async getSubscriptionPlans(query?: SubscriptionPlanQueryParams): Promise<AdminSubscriptionPlan[]> {
    const params: Record<string, string> = {}
    if (query?.search && query.search.trim() !== '') {
      params.search = query.search.trim()
    }
    if (query?.status) {
      params.status = query.status
    }
    if (query?.all !== undefined) {
      params.all = query.all ? 'true' : 'false'
    } else if (query?.status === 'ALL') {
      params.all = 'true'
    }

    const res = await apiClient.get<ApiResponse<AdminSubscriptionPlan[]> | AdminSubscriptionPlan[]>(
      '/subscription-plans',
      { params },
    )
    if (res.data && 'data' in res.data && Array.isArray(res.data.data)) {
      return res.data.data
    }
    if (Array.isArray(res.data)) {
      return res.data
    }
    return []
  },

  async getSubscriptionPlanById(id: string): Promise<AdminSubscriptionPlan> {
    const res = await apiClient.get<ApiResponse<AdminSubscriptionPlan> | AdminSubscriptionPlan>(
      `/subscription-plans/${id}`,
    )
    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data
    }
    return res.data as AdminSubscriptionPlan
  },

  async createSubscriptionPlan(
    payload: CreateSubscriptionPlanPayload,
  ): Promise<AdminSubscriptionPlan> {
    const res = await apiClient.post<ApiResponse<AdminSubscriptionPlan> | AdminSubscriptionPlan>(
      '/subscription-plans',
      payload,
    )
    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data
    }
    return res.data as AdminSubscriptionPlan
  },

  async updateSubscriptionPlan(
    id: string,
    payload: UpdateSubscriptionPlanPayload,
  ): Promise<AdminSubscriptionPlan> {
    const res = await apiClient.patch<ApiResponse<AdminSubscriptionPlan> | AdminSubscriptionPlan>(
      `/subscription-plans/${id}`,
      payload,
    )
    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data
    }
    return res.data as AdminSubscriptionPlan
  },

  async deactivateSubscriptionPlan(id: string): Promise<AdminSubscriptionPlan> {
    const res = await apiClient.patch<ApiResponse<AdminSubscriptionPlan> | AdminSubscriptionPlan>(
      `/subscription-plans/${id}/deactivate`,
    )
    if (res.data && 'data' in res.data && res.data.data) {
      return res.data.data
    }
    return res.data as AdminSubscriptionPlan
  },
}
