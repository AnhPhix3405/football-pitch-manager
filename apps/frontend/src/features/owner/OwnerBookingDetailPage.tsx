import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Input,
  Modal,
  Result,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { OwnerPageHeader } from './components/OwnerPageHeader'
import { useOwnerBookingDetail } from './hooks/useOwnerBookingDetail'
import { usePayment } from '../payment/hooks/usePayment'

const { Text } = Typography

export function OwnerBookingDetailPage() {
  const { t } = useTranslation()
  const { bookingId = '' } = useParams<{ bookingId: string }>()
  const [searchParams] = useSearchParams()
  const fieldIdParam = searchParams.get('fieldId') ?? ''
  const {
    booking,
    fieldId,
    courts,
    loading,
    error,
    reload,
    checkAssignment,
    confirm,
    reject,
    complete,
  } = useOwnerBookingDetail(bookingId, fieldIdParam)
  const [courtId, setCourtId] = useState('')
  const [note, setNote] = useState('')
  const [messageApi, contextHolder] = message.useMessage()
  const { loading: paymentLoading, handleConfirmCash, handleRefund } = usePayment()
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundReason, setRefundReason] = useState('')

  const confirmBooking = () =>
    Modal.confirm({
      title: t('ownerOps.confirmTitle'),
      content: t('ownerOps.confirmContent'),
      onOk: async () => {
        if (!courtId) {
          messageApi.error(t('ownerOps.selectCourtRequired'))
          return
        }
        const valid = await checkAssignment(courtId)
        if (!valid) {
          messageApi.error(t('ownerOps.unavailableCourt'))
          return
        }
        await confirm(courtId, note || undefined)
        messageApi.success(t('ownerOps.confirmSuccess'))
      },
    })

  const rejectBooking = () => {
    let reason = ''
    Modal.confirm({
      title: t('ownerOps.rejectTitle'),
      content: (
        <Input.TextArea
          rows={3}
          placeholder={t('ownerOps.rejectReason')}
          onChange={(event) => {
            reason = event.target.value
          }}
        />
      ),
      okText: t('ownerOps.rejectAction'),
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!reason.trim()) {
          messageApi.error(t('ownerOps.rejectReasonRequired'))
          return
        }
        await reject(reason.trim())
        messageApi.success(t('ownerOps.rejectSuccess'))
      },
    })
  }

  const completeBooking = () =>
    Modal.confirm({
      title: t('ownerOps.completeTitle'),
      onOk: async () => {
        await complete()
        messageApi.success(t('ownerOps.completeSuccess'))
      },
    })

  const onConfirmCash = () => {
    if (!booking) return
    const remaining = booking.totalPrice - booking.depositAmount
    Modal.confirm({
      title: 'Xác nhận đã nhận tiền mặt?',
      content: `Xác nhận khách hàng đã thanh toán số tiền còn lại ${formatPrice(remaining)}?`,
      okText: 'Xác nhận thu tiền',
      onOk: async () => {
        const tx = await handleConfirmCash(booking.id, {
          note: 'Thu tiền mặt tại sân',
        })
        if (tx) {
          messageApi.success('Đã xác nhận thanh toán tiền mặt thành công!')
          await reload()
        }
      },
    })
  }

  const onProcessRefund = async () => {
    if (!booking) return
    if (!refundReason.trim()) {
      messageApi.error('Vui lòng nhập lý do hoàn tiền cọc.')
      return
    }
    const res = await handleRefund(booking.id, {
      amount: booking.depositAmount,
      reason: refundReason,
    })
    if (res) {
      setRefundModalOpen(false)
      setRefundReason('')
      messageApi.success('Đã xử lý hoàn tiền cọc thành công!')
      await reload()
    }
  }

  if (loading)
    return (
      <section className="owner-page">
        <div style={{ textAlign: 'center', padding: 64 }}>
          <Spin size="large" />
        </div>
      </section>
    )

  if (error || !booking)
    return (
      <section className="owner-page">
        {contextHolder}
        <Result
          status="404"
          title={t('ownerOps.bookingNotFound')}
          subTitle={error}
          extra={
            <Link to="/owner/bookings">
              <Button>{t('ownerOps.backToBookings')}</Button>
            </Link>
          }
        />
      </section>
    )

  const statusColor =
    booking.status === 'confirmed' || booking.status === 'completed'
      ? 'green'
      : booking.status === 'rejected' || booking.status === 'cancelled'
        ? 'red'
        : 'gold'

  const remainingAmount = Math.max(0, booking.totalPrice - booking.depositAmount)
  const canConfirmCash =
    remainingAmount > 0 &&
    booking.paymentStatus !== 'paid' &&
    (booking.status === 'confirmed' || booking.status === 'completed')

  return (
    <section className="owner-page" style={{ padding: '16px 0' }}>
      {contextHolder}
      <OwnerPageHeader
        breadcrumbs={[
          { title: t('ownerOps.bookingsTitle'), href: '/owner/bookings' },
          { title: `Booking #${booking.id}` },
        ]}
        eyebrow={`BOOKING #${booking.id}`}
        title={
          booking.fieldName || `Sân ${booking.requestedCourtType}v${booking.requestedCourtType}`
        }
        subtitle={
          <span>
            <CalendarOutlined /> {dayjs(booking.bookingDate).format('DD/MM/YYYY')} ·{' '}
            {booking.startTime} – {booking.endTime}
          </span>
        }
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Tag color={statusColor}>{booking.status.toUpperCase()}</Tag>
            <Button icon={<ReloadOutlined />} onClick={() => void reload()} />
          </div>
        }
      />
      {error && <Alert type="error" showIcon message={error} />}
      <div className="owner-detail-grid">
        <section className="owner-panel">
          <h2>Thông tin booking</h2>
          <Descriptions
            column={1}
            items={[
              { key: 'booking', label: t('ownerOps.bookingId'), children: booking.id },
              { key: 'field', label: t('ownerOps.fieldComplex'), children: booking.fieldName || fieldId },
              {
                key: 'court',
                label: t('ownerOps.court'),
                children:
                  booking.courtName ||
                  `${t('ownerOps.courtType')} ${booking.requestedCourtType}v${booking.requestedCourtType}`,
              },
              {
                key: 'date',
                label: t('ownerOps.dateTime'),
                children: `${dayjs(booking.bookingDate).format('DD/MM/YYYY')} · ${booking.startTime} – ${booking.endTime}`,
              },
              { key: 'payment', label: t('ownerOps.paymentStatus'), children: booking.paymentStatus },
              { key: 'deposit', label: t('ownerOps.deposit'), children: formatPrice(booking.depositAmount) },
              { key: 'note', label: t('ownerOps.operationNote'), children: booking.ownerNote || '—' },
              { key: 'cancel', label: t('ownerOps.cancelReasonLabel'), children: booking.cancelReason || '—' },
            ]}
          />
          {booking.status === 'pending' && (
            <>
              <h2>{t('ownerOps.assignCourt')}</h2>
              {courts.length ? (
                <Select
                  value={courtId || undefined}
                  onChange={setCourtId}
                  placeholder={t('ownerOps.chooseCourt')}
                  style={{ width: '100%', marginBottom: 12 }}
                  options={courts.map((court) => ({
                    value: court.id,
                    label: `${court.name} · ${court.type}v${court.type}`,
                  }))}
                />
              ) : (
                <Empty description={t('ownerOps.noActiveCourts')} />
              )}
              <Input.TextArea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t('ownerOps.notePlaceholder')}
              />
            </>
          )}
          {booking.services.length > 0 && (
            <>
              <h2>{t('ownerOps.services')}</h2>
              {booking.services.map((service) => (
                <p key={service.serviceId}>
                  {service.serviceName || service.serviceId} × {service.quantity} ·{' '}
                  {formatPrice(service.subtotal)}
                </p>
              ))}
            </>
          )}
        </section>
        <aside className="owner-panel payment-panel">
          <span className="eyebrow">{t('ownerOps.bookingTotal')}</span>
          <dl>
            <div>
              <dt>{t('ownerOps.totalAmount')}</dt>
              <dd>{formatPrice(booking.totalPrice)}</dd>
            </div>
            <div>
              <dt>{t('ownerOps.deposit')}</dt>
              <dd className="lime">{formatPrice(booking.depositAmount)}</dd>
            </div>
            <div>
              <dt>{t('ownerOps.remainingAmount')}</dt>
              <dd>{formatPrice(remainingAmount)}</dd>
            </div>
          </dl>

          <div className="owner-booking-actions">
            {booking.status === 'pending' && (
              <div className="owner-booking-actions__decision">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  className="owner-booking-actions__accept"
                  disabled={!courts.length}
                  onClick={confirmBooking}
                >
                  {t('ownerOps.acceptAction')}
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  className="owner-booking-actions__reject"
                  onClick={rejectBooking}
                >
                  {t('ownerOps.rejectShortAction')}
                </Button>
              </div>
            )}

            {canConfirmCash && (
              <Button
                icon={<DollarCircleOutlined />}
                className="owner-booking-actions__cash"
                loading={paymentLoading}
                onClick={onConfirmCash}
              >
                {t('ownerOps.confirmCashAction')}
              </Button>
            )}

            {booking.depositAmount > 0 &&
              (booking.status === 'cancelled' || booking.status === 'rejected') && (
                <Button
                  danger
                  icon={<RollbackOutlined />}
                  className="owner-booking-actions__refund"
                  loading={paymentLoading}
                  onClick={() => setRefundModalOpen(true)}
                >
                  {t('ownerOps.refundDepositAction')}
                </Button>
              )}
            {booking.status === 'confirmed' && (
              <Button type="primary" className="owner-booking-actions__accept" onClick={completeBooking}>
                {t('ownerOps.completeAction')}
              </Button>
            )}
          </div>
        </aside>
      </div>

      <Modal
        open={refundModalOpen}
        title="Hoàn tiền cọc cho khách hàng"
        onCancel={() => setRefundModalOpen(false)}
        onOk={onProcessRefund}
        okText="Xác nhận hoàn tiền"
        okButtonProps={{ danger: true, loading: paymentLoading }}
        cancelText="Hủy bỏ"
      >
        <div style={{ padding: '12px 0' }}>
          <p>
            Số tiền hoàn:{' '}
            <strong style={{ color: '#ef4444' }}>
              {booking ? formatPrice(booking.depositAmount) : 0}
            </strong>
          </p>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>
            Lý do hoàn tiền:
          </Text>
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: Khách hủy sớm hợp lệ, thời tiết mưa bão sân ngập nước..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </div>
      </Modal>
    </section>
  )
}
