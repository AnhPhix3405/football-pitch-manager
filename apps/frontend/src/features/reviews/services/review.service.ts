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

type ReviewPageResponse<T> = Omit<PaginatedReviews<T>, 'items' | 'totalPages'> & {
  data: T[]
}

function normalizeReviewPage<T>(page: ReviewPageResponse<T>): PaginatedReviews<T> {
  return {
    items: page.data,
    total: page.total,
    page: page.page,
    limit: page.limit,
    totalPages: Math.max(1, Math.ceil(page.total / page.limit)),
  }
}

export const reviewService = {
  async createFieldReview(
    _fieldId: string,
    payload: CreateFieldReviewPayload,
  ): Promise<FieldReview> {
    const res = await apiClient.post<ApiResponse<FieldReview>>(
      '/reviews/fields',
      payload,
    )
    return res.data.data
  },

  async getFieldReviews(
    fieldId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedReviews<FieldReview>> {
    const res = await apiClient.get<ApiResponse<ReviewPageResponse<FieldReview>>>(
      `/reviews/fields/${fieldId}`,
      { params: { page, limit } },
    )
    return normalizeReviewPage(res.data.data)
  },

  async getFieldRatingSummary(fieldId: string): Promise<FieldRatingSummary> {
    const res = await apiClient.get<ApiResponse<FieldRatingSummary>>(
      `/reviews/fields/${fieldId}/summary`,
    )
    return res.data.data
  },

  async createUserReview(
    targetUserId: string,
    payload: CreateUserReviewPayload,
  ): Promise<UserReview> {
    const res = await apiClient.post<ApiResponse<UserReview>>(
      '/reviews/users',
      { targetUserId, ...payload },
    )
    return res.data.data
  },

  async getUserReviews(
    targetUserId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedReviews<UserReview>> {
    const res = await apiClient.get<ApiResponse<ReviewPageResponse<UserReview>>>(
      `/reviews/users/${targetUserId}`,
      { params: { page, limit } },
    )
    return normalizeReviewPage(res.data.data)
  },

  async getUserRatingSummary(targetUserId: string): Promise<UserRatingSummary> {
    const res = await apiClient.get<ApiResponse<UserRatingSummary>>(
      `/reviews/users/${targetUserId}/summary`,
    )
    return res.data.data
  },
}
