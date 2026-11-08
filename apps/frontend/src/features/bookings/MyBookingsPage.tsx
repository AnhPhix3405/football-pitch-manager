import { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Empty, Modal, Segmented, Spin, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PillButton } from '../../components/PillButton'
import { useBookings, type BookingFilterType } from './hooks/useBookings'
import { BookingCard } from './components/BookingCard'
import { smoothScrollToTop } from '../../utils/scroll.utils'
import { PaymentMethodModal } from '../payment/components/PaymentMethodModal'
import { FieldReviewModal } from '../reviews/components/FieldReviewModal'
import type { UiBooking } from './interface/booking.types'
import type { UserBooking } from '../user/user.data'

export function MyBookingsPage() {
  const { t } = useTranslation()
  const { filter, setFilter, visible, cancel, loading } = useBookings()
  const [messageApi, contextHolder] = message.useMessage()
  const [payingBooking, setPayingBooking] = useState<UserBooking | null>(null)
  const [reviewBooking, setReviewBooking] = useState<UiBooking | null>(null)

  const handleCancelConfirm = (id: string) =>
    Modal.confirm({
      title: t('booking.cancelModal.title'),
      content: t('booking.cancelModal.content'),
      okText: t('booking.cancelModal.ok'),
      okButtonProps: { danger: true },
      cancelText: t('booking.cancelModal.cancel'),
      onOk: async () => {
        try {
          await cancel(id)
          messageApi.success(t('booking.cancelModal.success'))
        } catch {
          messageApi.error(
            t('booking.cancelModal.error', {
              defaultValue: 'Hủy đặt sân thất bại. Vui lòng thử lại.',
            }),
          )
        }
      },
    })

  return (
    <section className="user-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">{t('booking.eyebrow')}</span>
          <h1>{t('booking.title')}</h1>
          <p>{t('booking.subtitle')}</p>
        </div>
        <Link to="/fields">
          <PillButton
            variant="primary"
            icon={<PlusOutlined />}
            text={t('booking.newBooking')}
          />
        </Link>
      </header>

      <Segmented
        block
        value={filter}
        onChange={(val) => {
          setFilter(val as BookingFilterType)
          if (window.scrollY > 150) {
            smoothScrollToTop(0)
          }
        }}
        options={[
          { value: 'upcoming', label: t('booking.tabs.upcoming') },
          { value: 'pending', label: t('booking.tabs.pending') },
          { value: 'history', label: t('booking.tabs.history') },
        ]}
      />

      {loading && visible.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : visible.length ? (
        <div className="booking-card-grid">
          {visible.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelConfirm}
              onReview={(item) => setReviewBooking(item)}
              onPay={(item) => setPayingBooking(item)}
            />
          ))}
        </div>
      ) : (
        <Empty description={t('booking.card.empty')} style={{ padding: '40px 0' }} />
      )}

      {payingBooking && (
        <PaymentMethodModal
          open={!!payingBooking}
          bookingId={payingBooking.id}
          bookingCode={payingBooking.id}
          amount={payingBooking.price}
          onClose={() => setPayingBooking(null)}
          onSuccess={() => {
            messageApi.success('Thao tác thanh toán hoàn tất.')
            setPayingBooking(null)
          }}
        />
      )}

      {reviewBooking && (
        <FieldReviewModal
          open={!!reviewBooking}
          fieldId={reviewBooking.fieldId}
          fieldName={reviewBooking.field}
          bookingId={reviewBooking.id}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null)
            messageApi.success(
              t('reviews.fieldReviewSuccess', {
                defaultValue: 'Cảm ơn bạn đã gửi đánh giá cho sân bóng!',
              }),
            )
          }}
        />
      )}
    </section>
  )
}
