import { useCallback, useEffect, useState } from 'react'
import type {
  CreateUserReviewPayload,
  UserRatingSummary,
  UserReview,
} from '../features/reviews/interface/review.types'
import { reviewService } from '../features/reviews/services/review.service'

export function useUserReviews(userId?: string) {
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [summary, setSummary] = useState<UserRatingSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(
    async (targetPage = 1) => {
      if (!userId) return
      setLoading(true)
      setError(null)
      try {
        const [reviewsData, summaryData] = await Promise.all([
          reviewService.getUserReviews(userId, targetPage, 10),
          reviewService.getUserRatingSummary(userId),
        ])
        setReviews(reviewsData.items)
        setTotal(reviewsData.total)
        setPage(reviewsData.page)
        setTotalPages(reviewsData.totalPages)
        setSummary(summaryData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể tải đánh giá'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    if (userId) {
      void fetchReviews(1)
    }
  }, [userId, fetchReviews])

  const submitReview = async (payload: CreateUserReviewPayload) => {
    if (!userId) return null
    setSubmitting(true)
    setError(null)
    try {
      const created = await reviewService.createUserReview(userId, payload)
      await fetchReviews(1)
      return created
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gửi đánh giá thất bại'
      setError(message)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  return {
    reviews,
    summary,
    total,
    page,
    totalPages,
    loading,
    submitting,
    error,
    fetchReviews,
    submitReview,
  }
}
