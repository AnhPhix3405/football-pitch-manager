import { useState } from 'react'
import {
  CalendarOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Modal, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../../fields/field.data'
import type { BookingStatus, UserBooking } from '../../user/user.data'

interface BookingCardProps {
  booking: UserBooking
  onCancel?: (id: string) => void
  onViewDetails?: (booking: UserBooking) => void
}

export function BookingCard({ booking, onCancel, onViewDetails }: BookingCardProps) {
  const { t } = useTranslation()
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const statusLabels: Record<BookingStatus, string> = {
    confirmed: t('booking.status.confirmed', { defaultValue: 'ĐÃ XÁC NHẬN' }),
    pending: t('booking.status.pending', { defaultValue: 'CHỜ ĐẶT CỌC' }),
    completed: t('booking.status.completed', { defaultValue: 'HOÀN TẤT' }),
    cancelled: t('booking.status.cancelled', { defaultValue: 'ĐÃ HỦY' }),
  }

  const handleView = () => {
    if (onViewDetails) {
      onViewDetails(booking)
    } else {
      setIsDetailOpen(true)
    }
  }

  return (
    <article className="booking-card">
      <div className="booking-card__visual">
        <img src={booking.image} alt={booking.field} loading="lazy" />
        <div className="booking-card__visual-overlay" />

        {/* Top Left: Status as Glass Pill */}
        <div className={`booking-card__status-pill booking-card__status-pill--${booking.status}`}>
          <span className="booking-card__status-dot" />
          <span>{statusLabels[booking.status]}</span>
        </div>

        {/* Top Right: Quick Actions (Eye & Trash icons) */}
        <div className="booking-card__top-actions">
          <Tooltip title={t('booking.card.viewDetails', { defaultValue: 'Xem chi tiết' })}>
            <button
              type="button"
              className="booking-card__icon-btn"
              onClick={handleView}
              aria-label={t('booking.card.viewDetails', { defaultValue: 'Xem chi tiết' })}
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          {onCancel && (booking.status === 'confirmed' || booking.status === 'pending') && (
            <Tooltip title={t('booking.card.cancel', { defaultValue: 'Hủy lịch đặt' })}>
              <button
                type="button"
                className="booking-card__icon-btn booking-card__icon-btn--danger"
                onClick={() => onCancel(booking.id)}
                aria-label={t('booking.card.cancel', { defaultValue: 'Hủy lịch đặt' })}
              >
                <DeleteOutlined />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="booking-card__body">
        <div className="booking-card__meta-top">
          <h3 className="booking-card__title">{booking.field}</h3>
          <p className="booking-card__location">
            <EnvironmentOutlined /> {booking.location}
          </p>
        </div>

        <div className="booking-card__info-row">
          <div className="booking-card__info-col">
            <span className="booking-card__label">
              <CalendarOutlined /> {t('booking.card.dateTime', { defaultValue: 'THỜI GIAN' })}
            </span>
            <span className="booking-card__value">
              {booking.date} · {booking.time}
            </span>
          </div>

          <div className="booking-card__info-col booking-card__info-col--right">
            <span className="booking-card__label">
              <TagOutlined /> {t('booking.card.total', { defaultValue: 'TỔNG TIỀN' })}
            </span>
            <span className="booking-card__price">{formatPrice(booking.price)}</span>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Modal
        open={isDetailOpen}
        title={t('booking.detailModal.title', { defaultValue: 'Chi tiết lịch đặt sân' })}
        footer={null}
        onCancel={() => setIsDetailOpen(false)}
        centered
        width={460}
      >
        <div className="booking-detail-modal">
          <div className="booking-detail-modal__header">
            <h4>{booking.field}</h4>
            <span className={`booking-card__status-pill booking-card__status-pill--${booking.status}`}>
              <span className="booking-card__status-dot" />
              <span>{statusLabels[booking.status]}</span>
            </span>
          </div>

          <div className="booking-detail-modal__grid">
            <div className="booking-detail-modal__item">
              <span className="label">Mã đặt sân</span>
              <span className="value font-mono">{booking.id}</span>
            </div>
            <div className="booking-detail-modal__item">
              <span className="label">Địa điểm</span>
              <span className="value">{booking.location}</span>
            </div>
            <div className="booking-detail-modal__item">
              <span className="label">Ngày đặt</span>
              <span className="value">{booking.date}</span>
            </div>
            <div className="booking-detail-modal__item">
              <span className="label">Khung giờ</span>
              <span className="value">{booking.time}</span>
            </div>
            <div className="booking-detail-modal__item full-width">
              <span className="label">Tổng tiền</span>
              <span className="value price">{formatPrice(booking.price)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </article>
  )
}
