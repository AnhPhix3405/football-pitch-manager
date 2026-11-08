import { UserOutlined } from '@ant-design/icons'
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
  summary?: FieldRatingSummary | null
  loading: boolean
  total: number
  page: number
  limit?: number
  onPageChange: (page: number) => void
  onOpenReviewModal?: () => void
}

export function FieldReviewList({
  reviews,
  loading,
  total,
  page,
  limit = 10,
  onPageChange,
}: FieldReviewListProps) {
  const { t } = useTranslation()

  return (
    <div className="field-reviews-section">
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
