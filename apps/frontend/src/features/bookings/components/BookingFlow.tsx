import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
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
  Select,
  Spin,
  Steps,
  message,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  BOOKING_TIME_SLOTS,
  COURT_TYPE_OPTIONS,
} from '~/constants/booking.constant'
import { formatPrice } from '../../fields/field.data'
import { useFieldPaymentOptions } from '../../../hooks/useFieldPaymentOptions'
import type { BookingPaymentOption } from '../../payment/interface/payment.interface'
import { PAYMENT_METHOD } from '../../payment/constants/payment.constant'
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
  const [slotIndex, setSlotIndex] = useState<number | undefined>(undefined)
  const [fieldServices, setFieldServices] = useState<PublicFieldServiceItem[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({}) // serviceId -> quantity
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<BookingPaymentOption>()
  const { settings: paymentSettings, error: paymentSettingsError } = useFieldPaymentOptions(field.id)
  const paymentOption = selectedPaymentOption && paymentSettings?.options.includes(selectedPaymentOption)
    ? selectedPaymentOption
    : paymentSettings?.options[0]
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

  const selectedSlot =
    slotIndex !== undefined ? BOOKING_TIME_SLOTS[slotIndex] : undefined

  const fieldId = field.id

  // Kiểm tra lịch trống khả dụng khi chọn ngày, loại sân và khung giờ
  const checkAvailability = useCallback(async () => {
    if (!selectedSlot || !fieldId) {
      setAvailabilityInfo(null)
      return
    }

    setCheckingAvailability(true)
    try {
      const res = await getFieldAvailabilityApi(fieldId, {
        date: date.format('YYYY-MM-DD'),
        courtType,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      })

      if (res && res.isFieldOpen === false) {
        setAvailabilityInfo({
          isAvailable: false,
          message: t('booking.flow.fieldClosedAlert', {
            defaultValue: 'Sân không mở cửa trong khung giờ này.',
          }),
        })
        return
      }

      const ct = res?.courtTypes?.find((c) => c.courtType === courtType)
      if (ct && ct.isAvailable === false) {
        setAvailabilityInfo({
          isAvailable: false,
          message: t('booking.flow.courtFullAlert', {
            defaultValue: 'Khung giờ này đã hết sân con trống cho loại sân này.',
          }),
        })
        return
      }

      setAvailabilityInfo({
        isAvailable: true,
        message: t('booking.flow.courtAvailableAlert', {
          defaultValue: 'Khung giờ khả dụng. Sân còn trống để bạn đặt lịch.',
        }),
      })
    } catch {
      // Fallback khi chạy thử nghiệm hoặc id sân mock
      setAvailabilityInfo({
        isAvailable: true,
        message: t('booking.flow.courtAvailableAlert', {
          defaultValue: 'Khung giờ khả dụng.',
        }),
      })
    } finally {
      setCheckingAvailability(false)
    }
  }, [selectedSlot, fieldId, date, courtType, t])

  useEffect(() => {
    if (open && slotIndex !== undefined) {
      checkAvailability()
    }
  }, [open, date, courtType, slotIndex, checkAvailability])

  // Tải danh sách dịch vụ thực tế của sân
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

  const pitchRate = quote ? quote.pitchPrice : field.pricePerHour
  const total = pitchRate + servicesTotal
  const depositValue = paymentSettings?.depositValue ?? 0
  const depositAmount = paymentOption === 'deposit'
    ? Math.min(total, paymentSettings?.depositType === 'percentage'
      ? Math.round(total * depositValue / 100)
      : depositValue)
    : 0
  const remainingPayable = Math.max(0, total - depositAmount)

  const reset = () => {
    setStep(0)
    setSlotIndex(undefined)
    setSelectedServices({})
    setBookingCode('')
    setCreatedBookingId('')
    setAvailabilityInfo(null)
    setQuote(null)
    onClose()
  }

  // Chuyển sang bước 2 và lấy báo giá chính thức
  const handleProceedToConfirm = async () => {
    if (!selectedSlot) return
    setQuoting(true)
    try {
      const quoteRes = await getFieldPriceQuoteApi(field.id, {
        courtType,
        date: date.format('YYYY-MM-DD'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      })
      if (quoteRes) {
        setQuote(quoteRes)
      }
    } catch {
      // Dùng fallback giá giờ của sân nếu báo giá API thất bại
      setQuote(null)
    } finally {
      setQuoting(false)
      setStep(1)
    }
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

      if (!paymentOption) return
      let id = createdBookingId
      if (!id) {
        const booking = await createBookingApi({
          fieldId: field.id,
          courtType,
          bookingDate: date.format('YYYY-MM-DD'),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          services: bookingServicesPayload,
        })
        id = booking.id
        setCreatedBookingId(id)
        setBookingCode(id.slice(0, 8).toUpperCase())
        onSuccess?.(id)
      }

      if (paymentOption !== 'cash') {
        await processPayment(id, PAYMENT_METHOD.VNPAY, undefined, paymentOption)
        return
      }
      const payment = await processPayment(id, PAYMENT_METHOD.CASH)
      if (payment) {
        setStep(2)
        messageApi.success(t('booking.flow.createSuccess'))
      }
    } catch (err: unknown) {
      messageApi.error(err instanceof Error ? err.message : t('payment.settings.error'))
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
              onChange={(val) => setCourtType(val as string)}
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
              onChange={(value) => value && setDate(value)}
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
              value={slotIndex}
              onChange={(event) => setSlotIndex(event.target.value)}
              className="time-grid"
            >
              {BOOKING_TIME_SLOTS.map((slotItem, index) => (
                <Radio.Button value={index} key={slotItem.label}>
                  <ClockCircleOutlined /> {slotItem.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </label>

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
              slotIndex === undefined ||
              checkingAvailability ||
              availabilityInfo?.isAvailable === false
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
              {date.format('dddd, DD/MM/YYYY')} · {selectedSlot?.label} (Sân {courtType}v{courtType})
            </p>
            <dl>
              <div>
                <dt>{t('booking.flow.pitchPrice')}</dt>
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

          <Select
            aria-label={t('payment.selector.title')}
            value={paymentOption}
            onChange={setSelectedPaymentOption}
            loading={!paymentSettings && !paymentSettingsError}
            disabled={submitting}
            options={paymentSettings?.options.map((value) => ({ value, label: t(`payment.options.${value}`) }))}
            style={{ width: '100%' }}
          />
          {paymentSettingsError && <p role="alert">{t('payment.settings.error')}</p>}
          {paymentOption && paymentOption !== 'cash' && (
            <p>{t('payment.settings.payNow', { amount: formatPrice(paymentOption === 'deposit' ? depositAmount : total) })}</p>
          )}

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
            <Button onClick={() => setStep(0)} disabled={submitting || Boolean(createdBookingId)}>
              {t('booking.flow.back')}
            </Button>
            <Button type="primary" loading={submitting} disabled={!paymentOption} onClick={confirmBooking}>
              {paymentOption !== 'cash'
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
          subTitle={`${t('booking.flow.bookingCode')} #${bookingCode} · ${date.format('DD/MM/YYYY')} · ${selectedSlot?.label}`}
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
