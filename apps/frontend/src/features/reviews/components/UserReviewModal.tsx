import { useState } from 'react'
import { Input, Modal, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { PeekRating } from '../../../components/PeekRating'
import { PillButton } from '../../../components/PillButton'
import {
  MAX_REVIEW_COMMENT_LENGTH,
  REVIEW_RATING_LABELS,
} from '../constants/review.constants'
import { reviewService } from '../services/review.service'

interface UserReviewModalProps {
  open: boolean
  targetUserId: string
  targetUserName?: string
  postId: string
  onClose: () => void
  onSuccess?: () => void
}

export function UserReviewModal({
  open,
  targetUserId,
  targetUserName = 'Người chơi',
  postId,
  onClose,
  onSuccess,
}: UserReviewModalProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!rating || rating < 1) {
      message.warning(t('reviews.selectRating', { defaultValue: 'Vui lòng chọn số sao đánh giá' }))
      return
    }

    setSubmitting(true)
    try {
      await reviewService.createUserReview(targetUserId, {
        postId,
        rating,
        comment: comment.trim() || undefined,
      })
      message.success(
        t('reviews.playerReviewSuccess', {
          defaultValue: 'Cảm ơn bạn đã gửi đánh giá tinh thần thể thao cho cầu thủ!',
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
      onCancel={onClose}
      centered
      destroyOnClose
      width={520}
      styles={{
        body: {
          background: 'rgba(18, 22, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
        },
      }}
    >
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xl font-bold text-white mb-1">
          {t('reviews.ratePlayerTitle', { defaultValue: 'Đánh giá tinh thần thể thao' })}
        </h3>
        <p className="text-sm text-zinc-400 mb-6">
          {targetUserName} · {t('reviews.ratePlayerSubtitle', { defaultValue: 'Ghi nhận thái độ thi đấu và tinh thần fair-play' })}
        </p>

        {/* PeekRating Micro Interaction */}
        <div className="py-4 px-6 rounded-2xl bg-black/30 border border-white/5 mb-6 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            {t('reviews.chooseSportsmanship', { defaultValue: 'Điểm tinh thần fair-play' })}
          </span>
          <PeekRating
            value={rating}
            onChange={setRating}
            labels={REVIEW_RATING_LABELS}
            size={36}
            activeColor="#10b981"
            idleColor="#3f3f46"
          />
        </div>

        {/* Comment Text Area */}
        <div className="w-full text-left mb-6">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {t('reviews.commentLabel', { defaultValue: 'Nhận xét chi tiết (tùy chọn)' })}
          </label>
          <Input.TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviews.playerCommentPlaceholder', {
              defaultValue: 'Lối chơi đẹp, đúng giờ, giao lưu vui vẻ, thân thiện...',
            })}
            maxLength={MAX_REVIEW_COMMENT_LENGTH}
            rows={4}
            showCount
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#fff',
              borderRadius: 12,
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            {t('common.cancel', { defaultValue: 'Hủy' })}
          </button>
          <PillButton
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            text={t('reviews.submitReview', { defaultValue: 'Gửi đánh giá' })}
          />
        </div>
      </div>
    </Modal>
  )
}
