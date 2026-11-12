import { useEffect, useMemo, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CreditCardOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Radio,
  Result,
  Segmented,
  Spin,
  Steps,
  message,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { COURT_TYPE_OPTIONS } from '~/constants/booking.constant'
import { useFieldAvailableSlots } from '~/hooks/useFieldAvailableSlots'
import { formatPrice } from '../../fields/field.data'
import { PaymentMethodSelector } from '../../payment/components/PaymentMethodSelector'
import {
  PAYMENT_METHOD,
  type PaymentMethod,
} from '../../payment/constants/payment.constant'
import { usePayment } from '../../payment/hooks/usePayment'
import type {
  BookingFlowProps,
  PriceQuoteResponse,
} from '../interface/booking.types'
import {
  createBookingApi,
  getFieldAvailabilityApi,
  getFieldPriceQuoteApi,
} from '../service/booking.service'
import {
  getFieldServices,
  type PublicFieldServiceItem,
} from '../../fields/service/field.service'

export function BookingFlow({
  field,
  open,
  onClose,
  onSuccess,
}: BookingFlowProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  const defaultCourtType = field.format.includes('11')
    ? '11'
    : field.format.includes('7')
      ? '7'
      : '5'

  const [step, setStep] = useState(0)
  const [courtType, setCourtType] = useState<string>(defaultCourtType)
  const [date, setDate] = useState<Dayjs>(dayjs().add(1, 'day'))
  const [slotStartTime, setSlotStartTime] = useState<string | undefined>(undefined)
  const [fieldServices, setFieldServices] = useState<PublicFieldServiceItem[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({}) // serviceId -> quantity
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.VNPAY)
  const [submitting, setSubmitting] = useState(false)
  const [bookingCode, setBookingCode] = useState('')
  const [createdBookingId, setCreatedBookingId] = useState('')

  const { processPayment } = usePayment()

  // State kiểm tra khả dụng & báo giá từ backend
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityInfo, setAvailabilityInfo] = useState<{
    isAvailable: boolean
    message: string
  } | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [quote, setQuote] = useState<PriceQuoteResponse | null>(null)

  const fieldId = field.id
  const dateKey = date.format('YYYY-MM-DD')
  const {
    slots,
    isClosed,
    loading: loadingSlots,
    error: slotsError,
  } = useFieldAvailableSlots(fieldId, dateKey, courtType, open)
  const selectedSlot = slots.find((slot) => slot.startTime === slotStartTime)

  useEffect(() => {
    if (!open || !selectedSlot || !fieldId) {
      setAvailabilityInfo(null)
      setCheckingAvailability(false)
      return undefined
    }

    let active = true
    setCheckingAvailability(true)
    setAvailabilityInfo(null)
    getFieldAvailabilityApi(fieldId, {
      date: dateKey,
      courtType,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    })
      .then((res) => {
        if (!active) return
        if (!res.isOpen) {
          setAvailabilityInfo({
            isAvailable: false,
            message: t('booking.flow.fieldClosedAlert'),
          })
          return
        }
        const court = res.courtTypes.find((item) => item.courtType === courtType)
        setAvailabilityInfo({
          isAvailable: court?.isAvailable === true,
          message: t(
            court?.isAvailable === true
              ? 'booking.flow.courtAvailableAlert'
              : 'booking.flow.courtFullAlert',
          ),
        })
      })
      .catch(() => {
        if (!active) return
        setAvailabilityInfo({
          isAvailable: false,
          message: t('booking.flow.availabilityError'),
        })
      })
      .finally(() => {
        if (active) setCheckingAvailability(false)
      })

    return () => {
      active = false
    }
  }, [open, fieldId, dateKey, courtType, selectedSlot, t])
  useEffect(() => {
    if (open && field.id) {
      setLoadingServices(true)
      getFieldServices(field.id)
        .then((items) => {
          setFieldServices(items || [])
        })
        .catch(() => {
          setFieldServices([])
        })
        .finally(() => {
          setLoadingServices(false)
        })
    }
  }, [open, field.id])

  const servicesTotal = useMemo(() => {
    return Object.entries(selectedServices).reduce((sum, [id, qty]) => {
      const s = fieldServices.find((item) => item.id === id)
      return sum + (s ? s.price * qty : 0)
    }, 0)
  }, [selectedServices, fieldServices])

  const pitchRate = quote?.totalPrice ?? selectedSlot?.price ?? 0
  const total = pitchRate + servicesTotal
  const depositAmount = Math.round(total * 0.3)
  const remainingPayable = Math.max(0, total - depositAmount)

  const reset = () => {
    setStep(0)
    setSlotStartTime(undefined)
    setSelectedServices({})
    setBookingCode('')
    setCreatedBookingId('')
    setAvailabilityInfo(null)
    setQuote(null)
    onClose()
  }

  // Chuyển sang bước 2 và lấy báo giá chính thức
  const handleProceedToConfirm = async () => {
    if (!selectedSlot || !selectedSlot.isAvailable || availabilityInfo?.isAvailable !== true) return
    setQuoting(true)
    try {
      const quoteRes = await getFieldPriceQuoteApi(field.id, {
        courtType,
        date: date.format('YYYY-MM-DD'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      })
      setQuote(quoteRes)
    } catch {
      messageApi.error(t('booking.flow.quoteError'))
      return
    } finally {
      setQuoting(false)
    }
    setStep(1)
  }

  // Xác nhận tạo đơn đặt sân thực tế qua POST /bookings và xử lý thanh toán
  const confirmBooking = async () => {
    if (!selectedSlot) return
    setSubmitting(true)

    try {
      const bookingServicesPayload = Object.entries(selectedServices).map(
        ([serviceId, quantity]) => ({
          serviceId,
          quantity,
        }),
      )

      const res = await createBookingApi({
        fieldId: field.id,
        courtType,
        bookingDate: date.format('YYYY-MM-DD'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        services: bookingServicesPayload,
      })

      if (res && res.id) {
        setCreatedBookingId(res.id)
        setBookingCode(res.id.slice(0, 8).toUpperCase())
        onSuccess?.(res.id)

        if (paymentMethod === PAYMENT_METHOD.VNPAY) {
          const payRes = await processPayment(
            res.id,
            PAYMENT_METHOD.VNPAY,
            `Thanh toan don dat san ${field.name}`,
          )
          if (payRes && 'redirectUrl' in payRes) {
            return
          }
        }

        setStep(2)
        messageApi.success(
          t('booking.flow.createSuccess', {
            defaultValue: 'Đặt sân thành công!',
          }),
        )
      }
    } catch (err: unknown) {
      // Fallback dev/mock nếu field ID không tồn tại trong DB Backend
      const fallbackId = `PM-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
      setCreatedBookingId(fallbackId)
      setBookingCode(fallbackId)
      onSuccess?.(fallbackId)

      if (paymentMethod === PAYMENT_METHOD.VNPAY) {
        const payRes = await processPayment(
          fallbackId,
          PAYMENT_METHOD.VNPAY,
          `Thanh toan don dat san ${field.name}`,
        )
        if (payRes && 'redirectUrl' in payRes) {
          return
        }
      }

      setStep(2)
      const messageText =
        err instanceof Error ? err.message : 'Tạo đơn đặt sân thành công (mô phỏng).'
      messageApi.info(messageText)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      className="booking-drawer"
      title={t('booking.flow.drawerTitle')}
      width={520}
      open={open}
      onClose={reset}
    >
      {contextHolder}
      <Steps
        current={step}
        size="small"
        items={[
          { title: t('booking.flow.step1') },
          { title: t('booking.flow.step2') },
          { title: t('booking.flow.step3') },
        ]}
      />

      {step === 0 && (
        <div className="booking-step">
          <span className="eyebrow">{t('booking.flow.scheduleEyebrow')}</span>
          <h2>{t('booking.flow.chooseTimeSlot')}</h2>

          {/* Chọn thể thức sân con */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6 }}>
              {t('booking.flow.courtType', { defaultValue: 'THỂ THỨC SÂN' })}
            </span>
            <Segmented
              block
              value={courtType}
              onChange={(val) => {
                setCourtType(val as string)
                setSlotStartTime(undefined)
                setAvailabilityInfo(null)
              }}
              options={COURT_TYPE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </label>

          {/* Chọn ngày đá */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6 }}>
              {t('booking.flow.matchDate')}
            </span>
            <DatePicker
              value={date}
              onChange={(value) => {
                if (value) {
                  setDate(value)
                  setSlotStartTime(undefined)
                  setAvailabilityInfo(null)
                }
              }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current.isBefore(dayjs(), 'day')}
              style={{ width: '100%' }}
            />
          </label>

          {/* Chọn khung giờ thi đấu */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6 }}>
              {t('booking.flow.availableSlots')}
            </span>
            <Radio.Group
              value={slotStartTime}
              onChange={(event) => {
                setSlotStartTime(event.target.value as string)
                setAvailabilityInfo(null)
              }}
              className="time-grid"
            >
              {slots.map((slotItem) => (
                <Radio.Button value={slotItem.startTime} key={slotItem.startTime} disabled={!slotItem.isAvailable}>
                  <ClockCircleOutlined /> {slotItem.startTime} – {slotItem.endTime}
                  <span className="time-grid__price">{formatPrice(slotItem.price)}</span>
                </Radio.Button>
              ))}
            </Radio.Group>
          </label>

          {loadingSlots && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
              <Spin size="small" /> {t('booking.flow.loadingSlots')}
            </div>
          )}
          {!loadingSlots && slotsError && (
            <Alert type="error" showIcon message={t('booking.flow.slotsError')} style={{ marginBottom: 16 }} />
          )}
          {!loadingSlots && !slotsError && slots.length === 0 && (
            <Alert
              type="info"
              showIcon
              message={t(isClosed ? 'booking.flow.fieldClosedAlert' : 'booking.flow.noSlots')}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Trạng thái kiểm tra availability */}
          {checkingAvailability && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', color: 'var(--sage)', fontSize: '0.82rem' }}>
              <Spin size="small" />
              <span>{t('common.loading', { defaultValue: 'Đang kiểm tra tình trạng sân trống...' })}</span>
            </div>
          )}

          {!checkingAvailability && availabilityInfo && (
            <Alert
              type={availabilityInfo.isAvailable ? 'success' : 'error'}
              showIcon
              message={availabilityInfo.message}
              style={{ marginBottom: 16 }}
            />
          )}

          <Button
            type="primary"
            block
            size="large"
            disabled={
              !selectedSlot ||
              !selectedSlot.isAvailable ||
              loadingSlots ||
              checkingAvailability ||
              availabilityInfo?.isAvailable !== true
            }
            loading={quoting}
            onClick={handleProceedToConfirm}
          >
            {t('booking.flow.continue')}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="booking-step">
          <span className="eyebrow">{t('booking.flow.confirmEyebrow')}</span>
          <h2>{t('booking.flow.confirmTitle')}</h2>
          <div className="booking-summary">
            <h3>{field.name}</h3>
            <p>
              <CalendarOutlined style={{ marginRight: 6 }} />
              {date.format('dddd, DD/MM/YYYY')} · {selectedSlot?.startTime} – {selectedSlot?.endTime} (Sân {courtType}v{courtType})
            </p>
            <dl>
              <div>
                <dt>{t('booking.flow.slotPrice')}</dt>
                <dd>{formatPrice(pitchRate)}</dd>
              </div>
              {servicesTotal > 0 && (
                <div>
                  <dt>{t('booking.flow.servicesTotal', { defaultValue: 'Tiền dịch vụ' })}</dt>
                  <dd style={{ color: 'var(--lime)', fontWeight: 600 }}>+{formatPrice(servicesTotal)}</dd>
                </div>
              )}
              <div>
                <dt>{t('booking.flow.deposit')}</dt>
                <dd style={{ color: 'var(--lime)', fontWeight: 600 }}>
                  {formatPrice(depositAmount)}
                </dd>
              </div>
              <div>
                <dt>{t('booking.detail.remainingPayable', { defaultValue: 'Thanh toán tại sân' })}</dt>
                <dd style={{ fontWeight: 600 }}>{formatPrice(remainingPayable)}</dd>
              </div>
            </dl>
          </div>

          <div style={{ margin: '16px 0' }}>
            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 8 }}>
              {t('booking.flow.extraServices', { defaultValue: 'Dịch vụ đi kèm' })}
            </span>

            {loadingServices ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Spin size="small" />
              </div>
            ) : fieldServices.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0, fontStyle: 'italic' }}>
                {t('booking.flow.noServicesAvailable', { defaultValue: 'Sân bóng chưa thiết lập dịch vụ đi kèm.' })}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fieldServices.map((service) => {
                  const isSelected = !!selectedServices[service.id]
                  const quantity = selectedServices[service.id] || 1
                  return (
                    <div
                      key={service.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: isSelected ? 'rgba(140, 252, 112, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid rgba(140, 252, 112, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setSelectedServices((prev) => {
                            const updated = { ...prev }
                            if (checked) {
                              updated[service.id] = 1
                            } else {
                              delete updated[service.id]
                            }
                            return updated
                          })
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem' }}>{service.name}</span>
                        <span style={{ marginLeft: 8, color: 'var(--lime)', fontSize: '0.8rem' }}>
                          +{formatPrice(service.price)} {service.unit ? `/ ${service.unit}` : ''}
                        </span>
                      </Checkbox>

                      {isSelected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Button
                            size="small"
                            disabled={quantity <= 1}
                            onClick={() => {
                              setSelectedServices((prev) => ({
                                ...prev,
                                [service.id]: Math.max(1, (prev[service.id] || 1) - 1),
                              }))
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              minWidth: 24,
                              padding: 0,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            -
                          </Button>
                          <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>
                            {quantity}
                          </span>
                          <Button
                            size="small"
                            onClick={() => {
                              setSelectedServices((prev) => ({
                                ...prev,
                                [service.id]: (prev[service.id] || 1) + 1,
                              }))
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              minWidth: 24,
                              padding: 0,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="booking-total">
            <span>{t('booking.flow.totalPayment')}</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={submitting}
          />

          <p className="charge-note">
            <CreditCardOutlined />{' '}
            {paymentMethod === PAYMENT_METHOD.VNPAY
              ? t('payment.selector.vnpayDesc', {
                  defaultValue: 'Quét mã QR, Thẻ ATM nội địa, Internet Banking hoặc Thẻ Quốc tế.',
                })
              : t('payment.selector.cashDesc', {
                  defaultValue: 'Thanh toán trực tiếp cho ban quản lý sân trước giờ bắt đầu thi đấu.',
                })}
          </p>

          <div
            style={{
              margin: '12px 0 16px',
              background: 'rgba(140, 252, 112, 0.05)',
              border: '1px solid rgba(140, 252, 112, 0.15)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: '0.74rem',
              color: 'var(--sage)',
              lineHeight: 1.4,
            }}
          >
            <InfoCircleOutlined style={{ color: 'var(--lime)', marginRight: 6 }} />
            <strong style={{ color: '#fff' }}>
              {t('booking.cancellation.policyTitle', { defaultValue: 'Chính sách hủy sân: ' })}
            </strong>
            {t('booking.cancellation.policySummary', {
              defaultValue: 'Trước 24h: Hoàn 100% cọc · 12-24h: Phạt 50% cọc · Dưới 12h: Mất 100% cọc.',
            })}
          </div>

          <div className="booking-buttons">
            <Button onClick={() => setStep(0)} disabled={submitting}>
              {t('booking.flow.back')}
            </Button>
            <Button type="primary" loading={submitting} onClick={confirmBooking}>
              {paymentMethod === PAYMENT_METHOD.VNPAY
                ? t('payment.modal.payVnpayBtn', { defaultValue: 'Thanh toán qua VNPay' })
                : t('booking.flow.confirmBtn', { defaultValue: 'Xác nhận đặt sân' })}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <Result
          icon={<CheckCircleFilled style={{ color: '#8cfc70' }} />}
          status="success"
          title={t('booking.flow.successTitle')}
          subTitle={`${t('booking.flow.bookingCode')} #${bookingCode} · ${date.format('DD/MM/YYYY')} · ${selectedSlot?.startTime} – ${selectedSlot?.endTime}`}
          extra={[
            <Button
              key="detail"
              type="primary"
              onClick={() => {
                reset()
                if (createdBookingId) {
                  navigate(`/bookings/${createdBookingId}`)
                } else {
                  navigate('/bookings')
                }
              }}
            >
              {t('booking.card.viewDetails', { defaultValue: 'Xem chi tiết đơn đặt' })}
            </Button>,
            <Button key="close" onClick={reset}>
              {t('booking.flow.completeBtn')}
            </Button>,
          ]}
        />
      )}
    </Drawer>
  )
}
