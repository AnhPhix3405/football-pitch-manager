import { useCallback, useEffect, useState } from 'react'
import type {
  CreateFieldReviewPayload,
  FieldRatingSummary,
  FieldReview,
} from '../features/reviews/interface/review.types'
import { reviewService } from '../features/reviews/services/review.service'

export function useFieldReviews(fieldId?: string) {
  const [reviews, setReviews] = useState<FieldReview[]>([])
  const [summary, setSummary] = useState<FieldRatingSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(
    async (targetPage = 1) => {
      if (!fieldId) return
      setLoading(true)
      setError(null)
      try {
        const [reviewsData, summaryData] = await Promise.all([
          reviewService.getFieldReviews(fieldId, targetPage, 10),
          reviewService.getFieldRatingSummary(fieldId),
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
    [fieldId],
  )

  useEffect(() => {
    if (fieldId) {
      void fetchReviews(1)
    }
  }, [fieldId, fetchReviews])

  const submitReview = async (payload: CreateFieldReviewPayload) => {
    if (!fieldId) return null
    setSubmitting(true)
    setError(null)
    try {
      const created = await reviewService.createFieldReview(fieldId, payload)
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
