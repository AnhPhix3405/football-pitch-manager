import { useState } from 'react'
import {
  CalendarOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  StarFilled,
  TagOutlined,
} from '@ant-design/icons'
import { Modal, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { BOOKING_STATUS, type BookingStatus } from '~/constants/booking.constant'
import { formatPrice } from '../../fields/field.data'
import type { BookingCardProps } from '../interface/booking.types'

export function BookingCard({ booking, onCancel, onViewDetails, onReview, onPay }: BookingCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const statusLabels: Record<BookingStatus, string> = {
    [BOOKING_STATUS.CONFIRMED]: t('booking.status.confirmed', { defaultValue: 'ĐÃ XÁC NHẬN' }),
    [BOOKING_STATUS.PENDING]: t('booking.status.pending', { defaultValue: 'CHỜ ĐẶT CỌC' }),
    [BOOKING_STATUS.COMPLETED]: t('booking.status.completed', { defaultValue: 'HOÀN TẤT' }),
    [BOOKING_STATUS.CANCELLED]: t('booking.status.cancelled', { defaultValue: 'ĐÃ HỦY' }),
    [BOOKING_STATUS.REJECTED]: t('booking.status.rejected', { defaultValue: 'ĐÃ TỪ CHỐI' }),
  }

  const handleView = () => {
    if (onViewDetails) {
      onViewDetails(booking)
    } else {
      navigate(`/bookings/${booking.id}`)
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
          <span>{statusLabels[booking.status] || booking.status}</span>
        </div>

        {/* Top Right: Quick Actions */}
        <div className="booking-card__top-actions">
          {onPay && booking.status === 'pending' && (
            <Tooltip title={t('booking.card.payDeposit', { defaultValue: 'Thanh toán cọc' })}>
              <button
                type="button"
                className="booking-card__icon-btn"
                style={{ color: '#8cfc70' }}
                onClick={() => onPay(booking)}
                aria-label={t('booking.card.payDeposit', { defaultValue: 'Thanh toán cọc' })}
              >
                <CreditCardOutlined />
              </button>
            </Tooltip>
          )}

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

          {onReview && booking.status === BOOKING_STATUS.COMPLETED && (
            <Tooltip title={t('reviews.ratePitch', { defaultValue: 'Đánh giá sân bóng' })}>
              <button
                type="button"
                className="booking-card__icon-btn"
                style={{ color: '#84cc16' }}
                onClick={() => onReview(booking)}
                aria-label={t('reviews.ratePitch', { defaultValue: 'Đánh giá sân bóng' })}
              >
                <StarFilled />
              </button>
            </Tooltip>
          )}

          {onCancel && (booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.PENDING) && (
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
          <h3 className="booking-card__title">
            <Link to={`/bookings/${booking.id}`} style={{ color: 'inherit' }}>
              {booking.field}
            </Link>
          </h3>
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

      {/* Booking Details Modal Fallback */}
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
              <span>{statusLabels[booking.status] || booking.status}</span>
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
