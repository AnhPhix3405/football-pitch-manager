import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  CreateFieldReviewPayload,
  CreateUserReviewPayload,
  FieldRatingSummary,
  FieldReview,
  PaginatedReviews,
  UserRatingSummary,
  UserReview,
} from '../interface/review.types'

export const reviewService = {
  async createFieldReview(
    fieldId: string,
    payload: CreateFieldReviewPayload,
  ): Promise<FieldReview> {
    const res = await apiClient.post<ApiResponse<FieldReview>>(
      `/fields/${fieldId}/reviews`,
      payload,
    )
    return res.data.data
  },

  async getFieldReviews(
    fieldId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedReviews<FieldReview>> {
    const res = await apiClient.get<ApiResponse<PaginatedReviews<FieldReview>>>(
      `/fields/${fieldId}/reviews`,
      { params: { page, limit } },
    )
    return res.data.data
  },

  async getFieldRatingSummary(fieldId: string): Promise<FieldRatingSummary> {
    const res = await apiClient.get<ApiResponse<FieldRatingSummary>>(
      `/fields/${fieldId}/rating-summary`,
    )
    return res.data.data
  },

  async createUserReview(
    targetUserId: string,
    payload: CreateUserReviewPayload,
  ): Promise<UserReview> {
    const res = await apiClient.post<ApiResponse<UserReview>>(
      `/users/${targetUserId}/reviews`,
      payload,
    )
    return res.data.data
  },

  async getUserReviews(
    targetUserId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedReviews<UserReview>> {
    const res = await apiClient.get<ApiResponse<PaginatedReviews<UserReview>>>(
      `/users/${targetUserId}/reviews`,
      { params: { page, limit } },
    )
    return res.data.data
  },

  async getUserRatingSummary(targetUserId: string): Promise<UserRatingSummary> {
    const res = await apiClient.get<ApiResponse<UserRatingSummary>>(
      `/users/${targetUserId}/rating-summary`,
    )
    return res.data.data
  },
}
