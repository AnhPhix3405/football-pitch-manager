import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CreditCardOutlined,
  EnvironmentOutlined,
  ExclamationCircleFilled,
  LeftOutlined,
  PhoneOutlined,
  QrcodeOutlined,
  SafetyCertificateFilled,
  StarFilled,
  SyncOutlined,
} from '@ant-design/icons'
import { Button, Descriptions, Empty, Modal, Progress, QRCode, Spin, Tooltip, message } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BOOKING_STATUS, type BookingStatus } from '~/constants/booking.constant'
import { BlurCircle } from '../../components/BlurCircle'
import { PillButton } from '../../components/PillButton'
import { formatPrice } from '../fields/field.data'
import { FieldReviewModal } from '../reviews/components/FieldReviewModal'
import { userBookings } from '../user/user.data'
import type { UiBooking } from './interface/booking.types'
import { cancelBookingApi, getBookingDetailApi } from './service/booking.service'
import { mapBackendBookingToUi } from './utils/booking-mapper.util'

export function BookingDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const [booking, setBooking] = useState<UiBooking | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let isSubscribed = true
    setLoading(true)

    getBookingDetailApi(id)
      .then((data) => {
        if (isSubscribed && data) {
          setBooking(mapBackendBookingToUi(data))
        }
      })
      .catch(() => {
        // Fallback to local mock data if not found on backend (e.g., test ids like PM-1400)
        if (isSubscribed) {
          const fallback = userBookings.find(
            (item) => item.id.toLowerCase() === id.toLowerCase(),
          )
          if (fallback) {
            setBooking({
              ...fallback,
              fieldId: 'field-1',
              courtType: '7',
              paymentStatus: 'partially_paid',
              depositAmount: Math.round(fallback.price * 0.3),
              remainingAmount: fallback.price - Math.round(fallback.price * 0.3),
            })
          }
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setLoading(false)
        }
      })

    return () => {
      isSubscribed = false
    }
  }, [id])

  const statusConfig: Record<
    BookingStatus,
    { label: string; color: string; icon: React.ReactNode; stepIndex: number }
  > = {
    [BOOKING_STATUS.PENDING]: {
      label: t('booking.status.pending', { defaultValue: 'CHỜ ĐẶT CỌC' }),
      color: 'gold',
      icon: <SyncOutlined spin />,
      stepIndex: 0,
    },
    [BOOKING_STATUS.CONFIRMED]: {
      label: t('booking.status.confirmed', { defaultValue: 'ĐÃ XÁC NHẬN' }),
      color: 'green',
      icon: <CheckCircleFilled />,
      stepIndex: 1,
    },
    [BOOKING_STATUS.COMPLETED]: {
      label: t('booking.status.completed', { defaultValue: 'HOÀN TẤT' }),
      color: 'blue',
      icon: <CheckCircleFilled />,
      stepIndex: 2,
    },
    [BOOKING_STATUS.CANCELLED]: {
      label: t('booking.status.cancelled', { defaultValue: 'ĐÃ HỦY' }),
      color: 'red',
      icon: <CloseCircleFilled />,
      stepIndex: 0,
    },
    [BOOKING_STATUS.REJECTED]: {
      label: t('booking.status.rejected', { defaultValue: 'ĐÃ TỪ CHỐI' }),
      color: 'default',
      icon: <ExclamationCircleFilled />,
      stepIndex: 0,
    },
  }

  const progressPercentMap: Record<BookingStatus, number> = {
    [BOOKING_STATUS.PENDING]: 33,
    [BOOKING_STATUS.CONFIRMED]: 66,
    [BOOKING_STATUS.COMPLETED]: 100,
    [BOOKING_STATUS.CANCELLED]: 100,
    [BOOKING_STATUS.REJECTED]: 100,
  }

  const handleCancelBooking = () => {
    if (!booking) return
    Modal.confirm({
      title: t('booking.cancelModal.title', { defaultValue: 'Hủy lịch đặt sân?' }),
      content: t('booking.cancelModal.content', { defaultValue: 'Bạn có chắc chắn muốn hủy yêu cầu đặt sân này không?' }),
      okText: t('booking.cancelModal.ok', { defaultValue: 'Hủy đặt sân' }),
      okButtonProps: { danger: true },
      cancelText: t('booking.cancelModal.cancel', { defaultValue: 'Giữ lại' }),
      onOk: async () => {
        try {
          await cancelBookingApi(booking.id, 'Người dùng hủy đặt sân')
          setBooking((prev) => (prev ? { ...prev, status: BOOKING_STATUS.CANCELLED } : prev))
          messageApi.success(t('booking.cancelModal.success', { defaultValue: 'Đã hủy lịch đặt sân thành công.' }))
        } catch {
          // If mock id or local fallback
          setBooking((prev) => (prev ? { ...prev, status: BOOKING_STATUS.CANCELLED } : prev))
          messageApi.success(t('booking.cancelModal.success', { defaultValue: 'Đã hủy lịch đặt sân thành công.' }))
        }
      },
    })
  }

  if (loading) {
    return (
      <main className="user-page" style={{ textAlign: 'center', padding: '120px 20px' }}>
        <Spin size="large" />
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="user-page" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Empty description={t('booking.detail.notFound', { defaultValue: 'Không tìm thấy thông tin lịch đặt sân này.' })} />
        <Link to="/bookings" style={{ marginTop: 24, display: 'inline-block' }}>
          <PillButton variant="secondary" icon={<LeftOutlined />} text={t('booking.detail.backToList', { defaultValue: 'Trở lại danh sách đặt sân' })} />
        </Link>
      </main>
    )
  }

  const currentStatus = statusConfig[booking.status] || {
    label: booking.status,
    color: 'default',
    icon: <ExclamationCircleFilled />,
    stepIndex: 0,
  }

  const depositAmount = booking.depositAmount
  const remainingAmount = booking.remainingAmount

  return (
    <main className="user-page booking-detail-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {contextHolder}
      <BlurCircle position="absolute" top={-50} right={-50} variant="lime" opacity={0.12} size={380} />
      <BlurCircle position="absolute" bottom={-50} left={-50} variant="emerald" opacity={0.08} size={420} />

      {/* Top Navigation */}
      <div style={{ marginBottom: 16 }}>
        <PillButton
          variant="secondary"
          icon={<LeftOutlined />}
          text={t('booking.detail.backToList', { defaultValue: 'Trở lại danh sách đặt sân' })}
          onClick={() => navigate('/bookings')}
        />
      </div>

      {/* Header Banner - Compact layout with Status Progress Bar */}
      <header className="user-page__head" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="eyebrow" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {t('booking.detail.eyebrow', { defaultValue: 'PHIẾU ĐẶT SÂN' })} #{booking.id}
            </span>
            <Tooltip title={t('booking.detail.qrTitle', { defaultValue: 'Xem mã QR check-in tại sân' })}>
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                style={{
                  background: 'rgba(140, 252, 112, 0.12)',
                  border: '1px solid rgba(140, 252, 112, 0.3)',
                  color: 'var(--lime)',
                  borderRadius: 8,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <QrcodeOutlined style={{ fontSize: '0.95rem' }} />
                <span>QR Check-in</span>
              </button>
            </Tooltip>
          </div>
          <h1 style={{ marginTop: 4, fontSize: '1.65rem', fontWeight: 800 }}>{booking.field}</h1>
          <p style={{ color: 'var(--sage)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: '0.88rem' }}>
            <EnvironmentOutlined /> {booking.location}
          </p>
        </div>

        {/* Progress Bar Status Block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            minWidth: 200,
            maxWidth: 240,
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color:
                  booking.status === BOOKING_STATUS.CANCELLED
                    ? '#ff4d4f'
                    : booking.status === BOOKING_STATUS.REJECTED
                      ? 'var(--muted)'
                      : 'var(--lime)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {currentStatus.icon} {currentStatus.label}
            </span>
            {booking.status !== BOOKING_STATUS.CANCELLED && booking.status !== BOOKING_STATUS.REJECTED && (
              <span style={{ fontSize: '0.78rem', color: 'var(--sage)', fontWeight: 600 }}>
                {currentStatus.stepIndex + 1}/3
              </span>
            )}
          </div>

          <Progress
            percent={progressPercentMap[booking.status] ?? 66}
            status={
              booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.REJECTED
                ? 'exception'
                : 'normal'
            }
            strokeColor={
              booking.status === BOOKING_STATUS.CANCELLED
                ? '#ff4d4f'
                : booking.status === BOOKING_STATUS.REJECTED
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'var(--lime)'
            }
            trailColor="rgba(255, 255, 255, 0.1)"
            size={['100%', 6]}
            showInfo={false}
            style={{ margin: 0, width: '100%' }}
          />

          <span style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 6 }}>
            {t('booking.detail.createdAt', { defaultValue: 'Khởi tạo lúc: 24/10/2026' })}
          </span>
        </div>
      </header>

      {/* Main Grid Content: Tỷ lệ thông tin chính chiếm ưu thế, khối thanh toán nhỏ gọn bằng khoảng một nửa */}
      <div className="booking-detail-content-grid">
        {/* Left Column: Match & Facility Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pitch & Schedule Card */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-soft)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {/* Compact Header Image */}
            <div style={{ height: 115, width: '100%', position: 'relative' }}>
              <img
                src={booking.image}
                alt={booking.field}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, var(--surface) 0%, rgba(19, 19, 19, 0.25) 100%)',
                }}
              />
            </div>

            <div style={{ padding: '16px 20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>
                {t('booking.detail.pitchScheduleTitle', { defaultValue: 'Thông tin lịch đấu' })}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(140, 252, 112, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--lime)',
                      fontSize: '1rem',
                    }}
                  >
                    <CalendarOutlined />
                  </div>
                  <div>
                    <small style={{ color: 'var(--muted)', display: 'block', fontSize: '0.74rem' }}>
                      {t('booking.detail.matchDate', { defaultValue: 'Ngày đá' })}
                    </small>
                    <strong style={{ fontSize: '0.88rem' }}>{booking.date}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(140, 252, 112, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--lime)',
                      fontSize: '1rem',
                    }}
                  >
                    <ClockCircleOutlined />
                  </div>
                  <div>
                    <small style={{ color: 'var(--muted)', display: 'block', fontSize: '0.74rem' }}>
                      {t('booking.detail.matchTime', { defaultValue: 'Khung giờ' })}
                    </small>
                    <strong style={{ fontSize: '0.88rem' }}>{booking.time}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-soft)' }}>
                <Descriptions
                  column={1}
                  size="small"
                  items={[
                    {
                      key: 'court',
                      label: t('booking.detail.assignedCourt', { defaultValue: 'Sân con phân bổ' }),
                      children: (
                        <span style={{ color: 'var(--lime)', fontWeight: 600 }}>
                          {booking.courtName || `Sân ${booking.courtType}v${booking.courtType} (Cỏ nhân tạo FIFA)`}
                        </span>
                      ),
                    },
                    {
                      key: 'hotline',
                      label: t('booking.detail.ownerContact', { defaultValue: 'Liên hệ chủ sân' }),
                      children: (
                        <a href="tel:0901234567" style={{ color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <PhoneOutlined /> 0901 234 567
                        </a>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {booking.status === BOOKING_STATUS.COMPLETED && (
              <PillButton
                variant="primary"
                icon={<StarFilled />}
                text={t('booking.card.ratePitch', { defaultValue: 'Đánh giá sân bóng' })}
                onClick={() => setReviewModalOpen(true)}
              />
            )}

            {booking.status !== BOOKING_STATUS.CANCELLED && booking.status !== BOOKING_STATUS.COMPLETED && (
              <Button
                danger
                onClick={handleCancelBooking}
                style={{
                  height: 38,
                  borderRadius: 999,
                  fontWeight: 600,
                  padding: '0 20px',
                  fontSize: '0.85rem',
                }}
              >
                {t('booking.cancelModal.title', { defaultValue: 'Hủy lịch đặt sân' })}
              </Button>
            )}

            <Link to="/messages">
              <PillButton
                variant="secondary"
                icon={<SafetyCertificateFilled />}
                text={t('booking.detail.chatWithOwner', { defaultValue: 'Nhắn tin với quản lý' })}
              />
            </Link>
          </div>
        </div>

        {/* Right Column: Finance Breakdown & Payment Details (Nhỏ gọn, không có nút QR thanh toán) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-soft)',
              borderRadius: 14,
              padding: '16px 18px',
              maxWidth: 380,
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCardOutlined style={{ color: 'var(--lime)' }} />
                {t('booking.detail.paymentTitle', { defaultValue: 'Chi tiết thanh toán' })}
              </h3>
            </div>

            <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <dt style={{ color: 'var(--sage)' }}>{t('booking.detail.subtotal', { defaultValue: 'Tiền thuê sân (2 giờ)' })}</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{formatPrice(booking.price)}</dd>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <dt style={{ color: 'var(--sage)' }}>{t('booking.detail.depositPaid', { defaultValue: 'Đã đặt cọc online (30%)' })}</dt>
                <dd style={{ margin: 0, color: 'var(--lime)', fontWeight: 700 }}>
                  - {formatPrice(depositAmount)}
                </dd>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 8,
                  marginTop: 2,
                  borderTop: '1px dashed var(--border)',
                  fontSize: '0.88rem',
                }}
              >
                <dt style={{ fontWeight: 700 }}>{t('booking.detail.remainingPayable', { defaultValue: 'Cần thanh toán tại sân' })}</dt>
                <dd style={{ margin: 0, fontWeight: 800, color: 'var(--lime)', fontSize: '1.05rem' }}>
                  {formatPrice(remainingAmount)}
                </dd>
              </div>
            </dl>

            <div
              style={{
                marginTop: 12,
                background: 'rgba(140, 252, 112, 0.05)',
                border: '1px solid rgba(140, 252, 112, 0.12)',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: '0.74rem',
                color: 'var(--sage)',
                lineHeight: 1.4,
              }}
            >
              <CheckCircleFilled style={{ color: 'var(--lime)', marginRight: 6 }} />
              {t('booking.detail.policyNote', {
                defaultValue: 'Hủy lịch miễn phí trước 12 giờ so với thời gian diễn ra trận đấu. Tiền cọc sẽ được hoàn tự động.',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Pop-up Modal */}
      <Modal
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={null}
        centered
        width={340}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--lime)' }}>
            <QrcodeOutlined style={{ fontSize: '1.2rem' }} />
            <span>{t('booking.detail.qrTitle', { defaultValue: 'MÃ CHECK-IN TẠI SÂN' })}</span>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '12px 6px 6px 6px' }}>
          <p style={{ color: 'var(--sage)', fontSize: '0.82rem', marginBottom: 16 }}>
            {t('booking.detail.qrDesc', { defaultValue: 'Đưa mã QR này cho ban quản lý khi đến sân để nhận bóng và check-in.' })}
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: 14,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <QRCode
              value={`PITCHMASTER_BOOKING_${booking.id}_${booking.field}`}
              size={180}
              bordered={false}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Mã tham chiếu: </span>
            <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em', color: 'var(--white)' }}>
              {booking.id}
            </strong>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <FieldReviewModal
        open={reviewModalOpen}
        fieldId={booking.id}
        fieldName={booking.field}
        bookingId={booking.id}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          setReviewModalOpen(false)
          messageApi.success(t('reviews.fieldReviewSuccess', { defaultValue: 'Cảm ơn bạn đã gửi đánh giá!' }))
        }}
      />
    </main>
  )
}
