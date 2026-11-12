import { useState } from 'react'
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  PhoneOutlined,
  StarFilled,
  ThunderboltFilled,
} from '@ant-design/icons'
import { Button, Empty, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BlurCircle } from '~/components/BlurCircle'
import { useFieldReviews } from '../../hooks/useFieldReviews'
import { BookingFlow } from '../bookings/components/BookingFlow'
import { FieldReviewList } from '../reviews/components/FieldReviewList'
import { DEFAULT_FIELD_FALLBACK_IMAGE } from './field.data'
import { useFieldDetail } from './hooks/useFieldDetail'

export function FieldDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { fieldId = '' } = useParams()
  const backLink = '/fields'
  const { field, loading } = useFieldDetail(fieldId)
  const {
    reviews,
    summary,
    loading: reviewsLoading,
    total: totalReviews,
    page: reviewsPage,
    fetchReviews,
  } = useFieldReviews(fieldId)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  if (loading) {
    return (
      <main className="detail-page" style={{ textAlign: 'center', padding: '120px 0' }}>
        <Spin size="large" />
      </main>
    )
  }

  if (!field) {
    return (
      <main className="detail-page">
        <div className="detail-empty-box">
          <Empty description={t('fields.empty', { defaultValue: 'Không tìm thấy sân bóng này.' })} />
          <Link to={backLink} style={{ marginTop: 16 }}>
            <Button type="primary">{t('fields.backToSearch', { defaultValue: 'Quay lại danh sách' })}</Button>
          </Link>
        </div>
      </main>
    )
  }

  const galleryImages = field.gallery.length > 0
    ? field.gallery
    : field.imageUrl ? [field.imageUrl] : []

  const ratingVal =
    summary && Number(summary.avgRating) > 0
      ? Number(summary.avgRating).toFixed(1)
      : Number(field.rating).toFixed(1)

  const reviewCountVal =
    summary && summary.totalReviews > 0
      ? summary.totalReviews
      : field.reviewCount || 0

  return (
    <main className="detail-page">
      {/* Hiệu ứng ánh sáng nền ambient glow */}
      <BlurCircle
        variant="lime"
        size={560}
        top="-40px"
        right="-80px"
        opacity={0.25}
        blur={120}
      />
      <BlurCircle
        variant="emerald"
        size={480}
        top="25%"
        left="-120px"
        opacity={0.2}
        blur={110}
      />
      <BlurCircle
        variant="blue"
        size={400}
        bottom="10%"
        right="-40px"
        opacity={0.15}
        blur={130}
      />

      {/* Nút quay lại danh sách đồng bộ phong cách với trang tìm đối */}
      <nav className="detail-top-nav">
        <Link className="detail-back-link" to={backLink}>
          ← {t('common.back', { defaultValue: 'Quay lại' })}
        </Link>
      </nav>

      <div className="detail-grid">
        {/* Cột trái: Gallery ảnh, Tiêu đề, Thông số và Đánh giá */}
        <section className="detail-main">
          {/* Gallery hình ảnh hiện đại */}
          <div className="field-gallery-card">
            <div className="field-gallery-card__main-wrap">
              {galleryImages.length > 0 ? (
                <img
                  className="field-gallery-card__main-img"
                  src={galleryImages[activeImage] || galleryImages[0]}
                  alt={`${field.name}, ảnh ${activeImage + 1}`}
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_FIELD_FALLBACK_IMAGE) {
                      e.currentTarget.src = DEFAULT_FIELD_FALLBACK_IMAGE
                    }
                  }}
                />
              ) : (
                <div className="field-gallery-card__empty">
                  <Empty description={t('fields.noImages')} />
                </div>
              )}
              <div className="field-gallery-card__badges">
                <span className="field-gallery-card__badge-format">{field.format}</span>
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className="field-gallery-card__thumbs">
                {galleryImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`field-gallery-card__thumb-btn ${activeImage === index ? 'field-gallery-card__thumb-btn--active' : ''
                      }`}
                  >
                    <img
                      src={image || DEFAULT_FIELD_FALLBACK_IMAGE}
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_FIELD_FALLBACK_IMAGE) {
                          e.currentTarget.src = DEFAULT_FIELD_FALLBACK_IMAGE
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tiêu đề & Thông tin sân */}
          <div className="field-header-card">
            <div className="field-header-card__info">
              <h1 className="field-header-card__name">{field.name}</h1>
              <p className="field-header-card__address">
                <EnvironmentOutlined /> {field.address}, {field.district}, {field.city}
              </p>
              <div className="field-header-card__tags">
                <span className="field-pill-tag field-pill-tag--format">{field.format}</span>
                <span className="field-pill-tag field-pill-tag--surface">{field.surface}</span>
              </div>
            </div>

            <div className="field-header-card__rating">
              <div className="field-header-card__score">
                <StarFilled /> {ratingVal}
              </div>
              <span className="field-header-card__reviews">
                {reviewCountVal} {t('fields.rating', { defaultValue: 'đánh giá' })}
              </span>
            </div>
          </div>

          {/* Mô tả & Tiện ích sân */}
          <article className="field-specs-card">
            <span className="field-specs-card__eyebrow">FIELD SPECIFICATIONS</span>
            <h2 className="field-specs-card__title">
              {t('fields.fieldInfo', { defaultValue: 'Thông tin sân bóng' })}
            </h2>
            <p className="field-specs-card__desc">{field.description}</p>

            <h3 className="field-specs-card__sub-title">
              {t('fields.amenitiesTitle', { defaultValue: 'Tiện ích & Dịch vụ' })}
            </h3>
            <div className="field-specs-card__amenities">
              {field.amenities && field.amenities.length > 0 ? (
                field.amenities.map((item) => (
                  <span key={item} className="amenity-chip">
                    <CheckCircleFilled /> {item}
                  </span>
                ))
              ) : (
                <span className="amenity-chip">
                  <CheckCircleFilled /> Mặt sân tiêu chuẩn
                </span>
              )}
            </div>
          </article>

          {/* Khu vực Đánh giá người dùng */}
          <div className="field-reviews-card">
            <FieldReviewList
              reviews={reviews}
              summary={summary}
              loading={reviewsLoading}
              total={totalReviews}
              page={reviewsPage}
              onPageChange={(p) => void fetchReviews(p)}
            />
          </div>
        </section>

        {/* Cột phải: Terminal Đặt Sân Trực Tuyến Hiện Đại */}
        <aside className="quick-book-card">
          <div className="quick-book-card__terminal-header">
            <span className="quick-book-card__pulse-dot" />
            <span className="quick-book-card__terminal-title">RESERVATION TERMINAL</span>
          </div>

          <div className="quick-book-card__price-row">
            <strong className="quick-book-card__price-val">{t('booking.flow.priceBySlot')}</strong>
          </div>

          <div className="quick-book-card__status-list">
            <div className="quick-book-card__status-row">
              <span className="quick-book-card__status-label">
                <ClockCircleOutlined /> LỊCH GẦN NHẤT
              </span>
              <span className="quick-book-card__status-val">Hôm nay · 18:00 - 22:00</span>
            </div>
            <div className="quick-book-card__status-row">
              <span className="quick-book-card__status-label">
                <ThunderboltFilled /> TRẠNG THÁI
              </span>
              <span className="quick-book-card__status-val quick-book-card__status-val--active">
                🟢 Sẵn sàng nhận lịch
              </span>
            </div>
            <div className="quick-book-card__status-row">
              <span className="quick-book-card__status-label">
                <PhoneOutlined /> HOTLINE HỖ TRỢ
              </span>
              <span className="quick-book-card__status-val quick-book-card__status-val--phone">
                {field.phone || '0901 234 567'}
              </span>
            </div>
          </div>

          {/* Khung giờ gợi ý trực quan */}
          <div className="quick-book-card__slots-section">
            <span className="quick-book-card__slots-label">KHUNG GIỜ PHỔ BIẾN HÔM NAY</span>
            <div className="quick-book-card__slots-grid">
              <span className="slot-chip">17:00 - 18:30</span>
              <span className="slot-chip slot-chip--available">18:30 - 20:00</span>
              <span className="slot-chip slot-chip--selected">20:00 - 21:30</span>
              <span className="slot-chip">21:30 - 23:00</span>
            </div>
          </div>

          {/* Dự tính chi phí */}
          <div className="quick-book-card__estimate">
            <span className="quick-book-card__estimate-label">{t('booking.flow.priceAfterSlot')}</span>
          </div>

          {/* Nút Đặt sân chính */}
          <Button
            type="primary"
            size="large"
            block
            onClick={() => setBookingOpen(true)}
            className="quick-book-card__btn-book"
          >
            {t('fields.proceedBooking', { defaultValue: 'TIẾN HÀNH ĐẶT SÂN →' })}
          </Button>

          {/* Nút Gọi Hotline phụ */}
          <Button
            size="large"
            block
            icon={<PhoneOutlined />}
            href={`tel:${field.phone || '0901234567'}`}
            className="quick-book-card__btn-hotline"
          >
            {t('fields.callHotline', { defaultValue: 'Gọi hotline sân' })}: {field.phone || '0901 234 567'}
          </Button>

          {/* Nút Nhắn tin chủ sân */}
          <Button
            size="large"
            block
            icon={<MessageOutlined />}
            onClick={() => navigate('/messages')}
            style={{
              marginTop: 10,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'var(--border)',
              color: 'var(--sage)',
              fontWeight: 600,
            }}
          >
            {t('fields.chatWithOwner', { defaultValue: 'Nhắn tin với chủ sân' })}
          </Button>
        </aside>
      </div>

      <BookingFlow
        field={field}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </main>
  )
}
