import { StarFilled, UserOutlined } from '@ant-design/icons'
import { Avatar, Pagination, Spin } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { PeekRating } from '../../../components/PeekRating'
import type {
  FieldRatingSummary,
  FieldReview,
} from '../interface/review.types'

interface FieldReviewListProps {
  reviews: FieldReview[]
  summary: FieldRatingSummary | null
  loading: boolean
  total: number
  page: number
  limit?: number
  onPageChange: (page: number) => void
  onOpenReviewModal?: () => void
}

export function FieldReviewList({
  reviews,
  summary,
  loading,
  total,
  page,
  limit = 10,
  onPageChange,
  onOpenReviewModal,
}: FieldReviewListProps) {
  const { t } = useTranslation()

  const avgScore = summary ? Number(summary.avgRating).toFixed(1) : '0.0'
  const totalCount = summary?.totalReviews ?? 0

  return (
    <div className="field-reviews-section">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl bg-zinc-900/60 border border-white/5 backdrop-blur-md mb-8">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
            <span className="text-3xl font-black">{avgScore}</span>
            <div className="flex items-center text-xs text-lime-400 mt-0.5">
              <StarFilled className="mr-1" />
              <span>/ 5.0</span>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">
              {t('reviews.ratingOverview', { defaultValue: 'Đánh giá từ khách hàng' })}
            </h4>
            <p className="text-sm text-zinc-400">
              {t('reviews.basedOn', {
                count: totalCount,
                defaultValue: `Dựa trên ${totalCount} lượt đánh giá thực tế từ người đặt sân`,
              })}
            </p>
          </div>
        </div>

        {onOpenReviewModal && (
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-lime-500 text-black hover:bg-lime-400 transition-colors shadow-lg shadow-lime-500/20 shrink-0"
          >
            {t('reviews.writeReview', { defaultValue: 'Viết đánh giá' })}
          </button>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <Spin />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-zinc-900/30 border border-white/5">
          <p className="text-zinc-500 text-sm">
            {t('reviews.noReviewsYet', {
              defaultValue: 'Chưa có đánh giá nào cho sân bóng này. Hãy là người đầu tiên trải nghiệm và chia sẻ nhé!',
            })}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((item) => {
            const reviewerName =
              item.reviewerProfile?.fullName ||
              item.reviewer?.profile?.fullName ||
              item.reviewer?.email?.split('@')[0] ||
              'Khách hàng'
            const avatarUrl =
              item.reviewerProfile?.avatarUrl || item.reviewer?.profile?.avatarUrl

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={avatarUrl || undefined}
                      icon={!avatarUrl && <UserOutlined />}
                      size={42}
                      className="border border-white/10"
                    />
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        {reviewerName}
                      </h5>
                      <span className="text-xs text-zinc-500">
                        {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  </div>

                  <PeekRating
                    value={item.rating}
                    readOnly
                    size={20}
                    showTip={false}
                    activeColor="#84cc16"
                  />
                </div>

                {item.comment && (
                  <p className="text-sm text-zinc-300 leading-relaxed pl-13">
                    {item.comment}
                  </p>
                )}
              </div>
            )
          })}

          {total > limit && (
            <div className="flex justify-center pt-6">
              <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={onPageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
