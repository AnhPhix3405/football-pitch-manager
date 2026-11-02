import {
  EnvironmentOutlined,
  LeftOutlined,
  SafetyCertificateFilled,
  StarFilled,
} from '@ant-design/icons'
import { Button, Empty, Spin, Tag } from 'antd'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookingFlow } from '../bookings/components/BookingFlow'
import { formatPrice } from './field.data'
import { useFieldDetail } from './hooks/useFieldDetail'
import { useFieldReviews } from '../../hooks/useFieldReviews'
import { FieldReviewList } from '../reviews/components/FieldReviewList'

export function FieldDetailPage() {
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
      <main className="detail-page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </main>
    )
  }

  if (!field) {
    return (
      <main className="detail-page">
        <Empty description="Không tìm thấy sân bóng này." />
        <Link to={backLink}>
          <Button>Quay lại danh sách</Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="detail-page">
      <Link className="back-link" to={backLink}>
        <LeftOutlined /> Trở lại kết quả tìm kiếm
      </Link>
      <div className="detail-grid">
        <section>
          <div className="field-gallery">
            <img
              className="field-gallery__main"
              src={field.gallery[activeImage]}
              alt={`${field.name}, ảnh ${activeImage + 1}`}
            />
            <div>
              {field.gallery.slice(1).map((image, index) => (
                <button
                  type="button"
                  key={image}
                  onClick={() => setActiveImage(index + 1)}
                >
                  <img src={image} alt={`Xem ảnh ${index + 2} của ${field.name}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="field-title">
            <div>
              <h1>{field.name}</h1>
              <p>
                <EnvironmentOutlined /> {field.address}, {field.district}
              </p>
              <div>
                <Tag>{field.format}</Tag>
                <Tag>{field.surface}</Tag>
                <Tag color="green">INSTANT BOOK</Tag>
              </div>
            </div>
            <strong>
              <StarFilled />{' '}
              {summary && Number(summary.avgRating) > 0
                ? Number(summary.avgRating).toFixed(1)
                : field.rating}
              <small>
                {summary && summary.totalReviews > 0
                  ? `${summary.totalReviews} đánh giá`
                  : `${field.reviewCount} đánh giá`}
              </small>
            </strong>
          </div>
          <article className="field-specs">
            <span className="eyebrow">FIELD SPECIFICATIONS</span>
            <h2>Thông tin sân</h2>
            <p>{field.description}</p>
            <h3>Tiện ích</h3>
            <ul>
              {field.amenities.map((item) => (
                <li key={item}>
                  <SafetyCertificateFilled /> {item}
                </li>
              ))}
            </ul>
          </article>
          <div className="mt-8">
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
        <aside className="quick-book">
          <span className="eyebrow">RESERVATION TERMINAL</span>
          <div className="quick-book__price">
            <strong>{formatPrice(field.pricePerHour)}</strong>
            <span>/ giờ</span>
          </div>
          <dl>
            <div>
              <dt>LỊCH GẦN NHẤT</dt>
              <dd>Hôm nay · 20:00</dd>
            </div>
            <div>
              <dt>TRẠNG THÁI</dt>
              <dd className={field.availableToday ? 'available' : ''}>
                {field.availableToday ? 'Còn lịch' : 'Hết lịch hôm nay'}
              </dd>
            </div>
          </dl>
          <div className="slot-preview">
            <span>17:00 - 18:00</span>
            <span>19:00 - 20:00</span>
            <span className="selected">20:00 - 21:00</span>
            <span className="disabled">21:00 - 22:00</span>
          </div>
          <div className="quick-book__total">
            <span>Ước tính (1 giờ)</span>
            <strong>{formatPrice(field.pricePerHour)}</strong>
          </div>
          <Button type="primary" size="large" block onClick={() => setBookingOpen(true)}>
            TIẾN HÀNH ĐẶT SÂN →
          </Button>
          <small>Bạn chưa bị tính phí.</small>
        </aside>
      </div>
      <BookingFlow field={field} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  )
}
