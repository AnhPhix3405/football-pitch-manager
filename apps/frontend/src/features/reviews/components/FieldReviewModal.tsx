import { useState } from 'react'
import { Modal, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { EmotionStarMascot } from './EmotionStarMascot'
import { MAX_REVIEW_COMMENT_LENGTH } from '../constants/review.constants'
import { reviewService } from '../services/review.service'

interface FieldReviewModalProps {
  open: boolean
  fieldId: string
  fieldName?: string
  bookingId: string
  onClose: () => void
  onSuccess?: () => void
}

export function FieldReviewModal({
  open,
  fieldId,
  fieldName = 'Sân bóng',
  bookingId,
  onClose,
  onSuccess,
}: FieldReviewModalProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const activeDisplayRating = hoverRating ?? rating

  const handleSubmit = async () => {
    if (!rating || rating < 1) {
      message.warning(
        t('reviews.selectRating', {
          defaultValue: 'Vui lòng chọn số sao đánh giá',
        }),
      )
      return
    }

    setSubmitting(true)
    try {
      await reviewService.createFieldReview(fieldId, {
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      })
      message.success(
        t('reviews.fieldReviewSuccess', {
          defaultValue: 'Cảm ơn bạn đã gửi đánh giá cho sân bóng!',
        }),
      )
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Gửi đánh giá không thành công'
      message.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      closable={false}
      className="review-emotion-modal"
      onCancel={onClose}
      centered
      destroyOnClose
      width={400}
      styles={{
        body: {
          padding: 0,
          background: '#181a20',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Golden Wave Header with Aperture for Mascot */}
        <div className="relative w-full h-32 overflow-visible bg-gradient-to-b from-[#EAB308] via-[#CA8A04] to-[#A16207]">
          {/* Wave Shapes */}
          <svg
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay pointer-events-none"
          >
            <path
              d="M 0 60 Q 100 20 200 60 T 400 60 L 400 120 L 0 120 Z"
              fill="#FFFFFF"
            />
          </svg>
          <svg
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
          >
            <path
              d="M 0 75 Q 120 40 220 75 T 400 65 L 400 120 L 0 120 Z"
              fill="#FDE047"
            />
          </svg>

          {/* Circular Dark Aperture for Star Mascot */}
          <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-[#181a20] border-4 border-[#181a20] shadow-[0_0_30px_rgba(250,204,21,0.25)] flex items-center justify-center z-10">
            <EmotionStarMascot rating={activeDisplayRating} size={88} />
          </div>
        </div>

        {/* Content Body */}
        <div className="w-full px-6 pt-14 pb-7 flex flex-col items-center">
          {/* Question / Title */}
          <h3 className="text-base sm:text-lg font-bold text-white mb-1">
            {t('reviews.howWouldYouRateField', {
              defaultValue: 'Bạn đánh giá thế nào về cụm sân này?',
            })}
          </h3>
          <p className="text-xs text-zinc-400 mb-5">
            {fieldName} · {t('reviews.rateFieldSubtitle', { defaultValue: 'Chia sẻ nhận xét sau trận đấu của bạn' })}
          </p>

          {/* Star Rating Row */}
          <div className="flex items-center justify-center gap-2.5 mb-5">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = activeDisplayRating >= star
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  aria-label={`${star} star`}
                >
                  <svg
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill={isFilled ? '#FBBF24' : '#334155'}
                    className={`transition-colors duration-200 ${isFilled
                      ? 'drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)]'
                      : 'opacity-40'
                      }`}
                  >
                    <path d="M12 2.5l2.95 6.42 7.05.78-5.25 4.77 1.45 6.95L12 17.85 5.8 21.42l1.45-6.95L2 9.7l7.05-.78L12 2.5z" />
                  </svg>
                </button>
              )
            })}
          </div>

          {/* Feedback Input / Textarea */}
          <div className="w-full mb-5 text-left">
            <input
              type="text"
              value={comment}
              onChange={(e) =>
                setComment(e.target.value.slice(0, MAX_REVIEW_COMMENT_LENGTH))
              }
              placeholder={t('reviews.commentPlaceholder', {
                defaultValue: 'Ý kiến đóng góp của bạn rất quan trọng với chúng tôi...',
              })}
              className="w-full bg-white/5 border-b border-zinc-700 focus:border-amber-400 py-2 px-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors rounded"
            />
            {comment.length > 0 && (
              <div className="text-right text-[10px] text-zinc-500 mt-1 px-1">
                {comment.length}/{MAX_REVIEW_COMMENT_LENGTH}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-full text-sm font-extrabold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center disabled:opacity-50"
          >
            {submitting ? '...' : t('reviews.submitBtn', { defaultValue: 'Gửi đánh giá' })}
          </button>

          {/* Skip / Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="mt-3.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            {t('reviews.skipBtn', { defaultValue: 'No, Thanks!' })}
          </button>
        </div>
      </div>
    </Modal>
  )
}
