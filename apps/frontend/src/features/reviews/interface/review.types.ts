export interface ReviewerProfile {
  fullName?: string | null
  avatarUrl?: string | null
}

export interface ReviewerUser {
  id: string
  email?: string
  profile?: ReviewerProfile | null
}

export interface FieldReview {
  id: string
  fieldId: string
  reviewerId: string
  bookingId: string
  rating: number
  comment?: string | null
  isFlagged?: boolean
  createdAt: string
  reviewer?: ReviewerUser
  reviewerProfile?: ReviewerProfile | null
}

export interface UserReview {
  id: string
  targetUserId: string
  reviewerId: string
  postId: string
  rating: number
  comment?: string | null
  isFlagged?: boolean
  createdAt: string
  reviewer?: ReviewerUser
  reviewerProfile?: ReviewerProfile | null
}

export interface FieldRatingSummary {
  fieldId: string
  avgRating: string | number
  totalReviews: number
  bayesianScore: string | number
}

export interface UserRatingSummary {
  userId: string
  avgRating: string | number
  totalReviews: number
  sportsmanshipScore: string | number
}

export interface CreateFieldReviewPayload {
  bookingId: string
  rating: number
  comment?: string
}

export interface CreateUserReviewPayload {
  postId: string
  rating: number
  comment?: string
}

export interface PaginatedReviews<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
