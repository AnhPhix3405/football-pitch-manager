import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CreditCardOutlined,
  EnvironmentOutlined,
  ExclamationCircleFilled,
  InfoCircleOutlined,
  LeftOutlined,
  MessageOutlined,
  PhoneOutlined,
  QrcodeOutlined,
  StarFilled,
  SyncOutlined,
  WarningFilled,
} from '@ant-design/icons'
import { Button, Descriptions, Empty, Input, Modal, Progress, QRCode, Spin, Tooltip, message } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BOOKING_STATUS, type BookingStatus } from '~/constants/booking.constant'
import { BlurCircle } from '../../components/BlurCircle'
import { PillButton } from '../../components/PillButton'
import { formatPrice } from '../fields/field.data'
import { FieldReviewModal } from '../reviews/components/FieldReviewModal'
import { userBookings } from '../user/user.data'
import type { CancellationPreviewData, UiBooking } from './interface/booking.types'
import { cancelBookingApi, getBookingDetailApi, getCancellationPreviewApi } from './service/booking.service'
import { mapBackendBookingToUi } from './utils/booking-mapper.util'

export function BookingDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelPreview, setCancelPreview] = useState<CancellationPreviewData | null>(null)
  const [cancelPreviewLoading, setCancelPreviewLoading] = useState(false)
  const [cancelReasonInput, setCancelReasonInput] = useState('')
  const [cancelling, setCancelling] = useState(false)
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

  const handleOpenCancelModal = async () => {
    if (!booking) return
    setCancelModalOpen(true)
    setCancelPreviewLoading(true)
    setCancelReasonInput('')
    try {
      const preview = await getCancellationPreviewApi(booking.id)
      setCancelPreview(preview)
    } catch {
      // Fallback calculation for mock bookings
      const deposit = booking.depositAmount
      setCancelPreview({
        bookingId: booking.id,
        hoursUntilMatch: 24,
        canCancel: true,
        penaltyPercentage: 0,
        depositAmount: deposit,
        penaltyAmount: 0,
        refundAmount: deposit,
        policyDescription: t('booking.cancellation.tier24h', {
          defaultValue: 'Hủy trước 24 giờ: Miễn phí hủy, hoàn 100% tiền đặt cọc.',
        }),
      })
    } finally {
      setCancelPreviewLoading(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (!booking) return
    const reason =
      cancelReasonInput.trim() ||
      t('booking.cancellation.defaultReason', { defaultValue: 'Người dùng hủy đặt sân' })
    try {
      setCancelling(true)
      const updated = await cancelBookingApi(booking.id, reason)
      if (updated) {
        setBooking(mapBackendBookingToUi(updated))
      } else {
        setBooking((prev) => (prev ? { ...prev, status: BOOKING_STATUS.CANCELLED } : prev))
      }
      messageApi.success(
        t('booking.cancelModal.success', { defaultValue: 'Đã hủy lịch đặt sân thành công.' }),
      )
      setCancelModalOpen(false)
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        t('booking.cancellation.failed', { defaultValue: 'Có lỗi xảy ra khi hủy đặt sân' })
      messageApi.error(errorMessage)
    } finally {
      setCancelling(false)
    }
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

      {/* Cancellation Notice Banner */}
      {booking.status === BOOKING_STATUS.CANCELLED && (
        <div
          style={{
            background: 'rgba(255, 77, 79, 0.08)',
            border: '1px solid rgba(255, 77, 79, 0.25)',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '1.25rem', marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#ff7875', fontSize: '0.95rem', marginBottom: 4 }}>
              {t('booking.cancellation.bannerTitle', { defaultValue: 'Lịch đặt sân đã bị hủy' })}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sage)', lineHeight: 1.5 }}>
              {booking.cancelReason ||
                t('booking.cancellation.defaultReason', { defaultValue: 'Người dùng đã hủy lịch đặt sân.' })}
            </p>
            <div style={{ marginTop: 8, fontSize: '0.82rem' }}>
              {booking.paymentStatus === 'refunded' && (
                <span style={{ color: '#52c41a', fontWeight: 600 }}>
                  ✓ {t('booking.cancellation.statusRefunded', { defaultValue: 'Đã hoàn trả 100% tiền cọc (Miễn phí hủy trước 24h).' })}
                </span>
              )}
              {booking.paymentStatus === 'partially_refunded' && (
                <span style={{ color: '#faad14', fontWeight: 600 }}>
                  ⚠ {t('booking.cancellation.statusPartiallyRefunded', { defaultValue: 'Đã hoàn trả 50% tiền cọc (Phạt 50% do hủy trong 12-24h).' })}
                </span>
              )}
              {booking.paymentStatus === 'penalty_deducted' && (
                <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                  ✕ {t('booking.cancellation.statusPenaltyDeducted', { defaultValue: 'Không hoàn tiền cọc (Phạt 100% do hủy sát giờ đá < 12h).' })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Notice Banner */}
      {booking.status === BOOKING_STATUS.REJECTED && (
        <div
          style={{
            background: 'rgba(250, 173, 20, 0.08)',
            border: '1px solid rgba(250, 173, 20, 0.35)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <ExclamationCircleFilled style={{ color: '#faad14', fontSize: '1.35rem', marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#faad14', fontSize: '1rem', marginBottom: 4 }}>
              {t('booking.rejected.bannerTitle', { defaultValue: 'Đơn đặt sân đã bị chủ sân từ chối' })}
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: 'var(--sage)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                {t('booking.rejected.reasonLabel', { defaultValue: 'Lý do từ chối:' })}
              </span>{' '}
              {booking.ownerNote ||
                t('booking.rejected.defaultReason', {
                  defaultValue: 'Chủ sân hiện không thể tiếp nhận khung giờ này.',
                })}
            </p>
            <div
              style={{
                background: 'rgba(250, 173, 20, 0.1)',
                border: '1px dashed rgba(250, 173, 20, 0.4)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: '0.85rem',
                color: '#fff',
                lineHeight: 1.5,
              }}
            >
              ℹ️ {Number(booking.depositAmount) > 0 ? (
                <>
                  {t('booking.rejected.depositPaidNotice', {
                    defaultValue: `Đơn đã thanh toán cọc ${Number(booking.depositAmount).toLocaleString('vi-VN')}đ. Vui lòng liên hệ trực tiếp với chủ sân để nhận lại 100% tiền cọc.`,
                    amount: Number(booking.depositAmount).toLocaleString('vi-VN'),
                  })}
                </>
              ) : (
                t('booking.rejected.refundNotice', {
                  defaultValue: 'Vui lòng liên hệ với chủ sân để được giải đáp thắc mắc.',
                })
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to={`/messages?fieldId=${booking.fieldId}`}>
                <PillButton
                  variant="primary"
                  icon={<MessageOutlined />}
                  text={t('booking.rejected.chatWithOwnerBtn', {
                    defaultValue: 'Nhắn tin chủ sân nhận hoàn cọc',
                  })}
                />
              </Link>
              {booking.phone && (
                <a href={`tel:${booking.phone}`}>
                  <PillButton
                    variant="secondary"
                    icon={<PhoneOutlined />}
                    text={`${t('booking.rejected.callOwnerBtn', { defaultValue: 'Gọi chủ sân' })}: ${booking.phone}`}
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

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
                onClick={handleOpenCancelModal}
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

            <Link to={`/messages?fieldId=${booking.fieldId}`}>
              <PillButton
                variant="secondary"
                icon={<MessageOutlined />}
                text={t('booking.detail.chatWithOwner', { defaultValue: 'Nhắn tin với chủ sân' })}
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
              {booking.services && booking.services.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <dt style={{ color: 'var(--sage)' }}>{t('booking.detail.pitchFee', { defaultValue: 'Tiền thuê sân' })}</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>
                      {formatPrice(booking.price - booking.services.reduce((s, item) => s + (item.subtotal || 0), 0))}
                    </dd>
                  </div>
                  <div style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>
                      {t('booking.detail.attachedServices', { defaultValue: 'Dịch vụ đi kèm' })}:
                    </span>
                    {booking.services.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2 }}>
                        <span style={{ color: 'var(--sage)' }}>{s.serviceName || 'Dịch vụ'} (x{s.quantity})</span>
                        <span style={{ fontWeight: 600 }}>+{formatPrice(s.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <dt style={{ color: 'var(--sage)' }}>{t('booking.detail.subtotal', { defaultValue: 'Tiền thuê sân (2 giờ)' })}</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>{formatPrice(booking.price)}</dd>
                </div>
              )}

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
                defaultValue: 'Chính sách hủy: Trước 24h hoàn 100% cọc · Từ 12-24h phạt 50% cọc · Dưới 12h phạt 100% cọc.',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal
        open={cancelModalOpen}
        onCancel={() => !cancelling && setCancelModalOpen(false)}
        footer={null}
        centered
        width={460}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff4d4f' }}>
            <CloseCircleFilled style={{ fontSize: '1.2rem' }} />
            <span>{t('booking.cancelModal.title', { defaultValue: 'Xác nhận hủy đặt sân' })}</span>
          </div>
        }
      >
        {cancelPreviewLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 12, color: 'var(--sage)', fontSize: '0.85rem' }}>
              {t('booking.cancellation.loadingPreview', { defaultValue: 'Đang kiểm tra chính sách hủy...' })}
            </p>
          </div>
        ) : cancelPreview ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            {!cancelPreview.canCancel ? (
              <div
                style={{
                  background: 'rgba(255, 77, 79, 0.1)',
                  border: '1px solid rgba(255, 77, 79, 0.3)',
                  borderRadius: 10,
                  padding: '14px',
                  color: '#ff4d4f',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                }}
              >
                <WarningFilled style={{ marginRight: 8 }} />
                <strong>{t('booking.cancellation.cannotCancelTitle', { defaultValue: 'Không thể hủy: ' })}</strong>
                {cancelPreview.blockReason ||
                  t('booking.cancellation.matchStarted', { defaultValue: 'Trận đấu đã bắt đầu hoặc đã kết thúc.' })}
              </div>
            ) : (
              <>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 10,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lime)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                    <InfoCircleOutlined />
                    <span>{t('booking.cancellation.policyNotice', { defaultValue: 'Chính sách áp dụng' })}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--sage)', lineHeight: 1.4 }}>
                    {cancelPreview.policyDescription}
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {t('booking.cancellation.hoursLeft', {
                      defaultValue: 'Thời gian còn lại trước trận đấu: ~{{hours}} giờ',
                      hours: cancelPreview.hoursUntilMatch > 0 ? cancelPreview.hoursUntilMatch.toFixed(1) : '0',
                    })}
                  </p>
                </div>

                <div
                  style={{
                    background: 'var(--surface-hover)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>{t('booking.flow.deposit', { defaultValue: 'Tiền cọc đã thanh toán' })}</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(cancelPreview.depositAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>
                      {t('booking.cancellation.penaltyRate', { defaultValue: 'Tỷ lệ phạt' })} ({cancelPreview.penaltyPercentage}%)
                    </span>
                    <span style={{ color: cancelPreview.penaltyAmount > 0 ? '#ff4d4f' : 'var(--sage)', fontWeight: 600 }}>
                      {cancelPreview.penaltyAmount > 0 ? `-${formatPrice(cancelPreview.penaltyAmount)}` : '0đ'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                      borderTop: '1px dashed var(--border)',
                      fontWeight: 700,
                    }}
                  >
                    <span>{t('booking.cancellation.refundAmount', { defaultValue: 'Số tiền cọc dự kiến hoàn' })}</span>
                    <span style={{ color: cancelPreview.refundAmount > 0 ? 'var(--lime)' : '#ff4d4f', fontSize: '1rem' }}>
                      {formatPrice(cancelPreview.refundAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--sage)',
                      marginBottom: 6,
                    }}
                  >
                    {t('booking.cancellation.reasonLabel', { defaultValue: 'Lý do hủy lịch đặt sân (không bắt buộc):' })}
                  </label>
                  <Input.TextArea
                    rows={3}
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    placeholder={t('booking.cancellation.reasonPlaceholder', {
                      defaultValue: 'Nhập lý do của bạn (bận đột xuất, đổi giờ, v.v.)...',
                    })}
                    maxLength={300}
                    showCount
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'var(--border)',
                      color: '#fff',
                    }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <Button onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
                {t('booking.cancelModal.cancel', { defaultValue: 'Giữ lại' })}
              </Button>
              {cancelPreview.canCancel && (
                <Button danger type="primary" onClick={handleConfirmCancel} loading={cancelling}>
                  {t('booking.cancelModal.ok', { defaultValue: 'Xác nhận hủy đặt sân' })}
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

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
        fieldId={booking.fieldId || booking.id}
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
