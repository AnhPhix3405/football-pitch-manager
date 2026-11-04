import { CheckCircleFilled, ClockCircleOutlined, CreditCardOutlined } from '@ant-design/icons'
import { Alert, Button, Checkbox, DatePicker, Drawer, Radio, Result, Steps } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../../fields/field.data'
import type { FootballField } from '../../fields/interface/field.types'
import { PaymentMethodSelector } from '../../payment/components/PaymentMethodSelector'
import { PAYMENT_METHOD, type PaymentMethod } from '../../payment/constants/payment.constant'
import { usePayment } from '../../payment/hooks/usePayment'

const timeSlots = [
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
]
const extras = [
  { name: 'Thuê bóng thi đấu', price: 30000 },
  { name: 'Nước uống cho đội', price: 50000 },
  { name: 'Thuê áo bib', price: 40000 },
]

export function BookingFlow({
  field,
  open,
  onClose,
}: {
  field: FootballField
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [date, setDate] = useState<Dayjs>(dayjs().add(1, 'day'))
  const [slot, setSlot] = useState<string | undefined>('18:00 - 19:00')
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.VNPAY)
  const [submitting, setSubmitting] = useState(false)
  const [bookingCode, setBookingCode] = useState<string>('')
  const { processPayment } = usePayment()

  const extrasTotal = useMemo(
    () =>
      extras
        .filter((extra) => selectedExtras.includes(extra.name))
        .reduce((sum, extra) => sum + extra.price, 0),
    [selectedExtras],
  )
  const total = field.pricePerHour + extrasTotal

  const reset = () => {
    setStep(0)
    setSlot(undefined)
    setSelectedExtras([])
    setBookingCode('')
    onClose()
  }

  const confirm = async () => {
    setSubmitting(true)
    const code = crypto.randomUUID().slice(0, 6).toUpperCase()
    setBookingCode(code)

    if (paymentMethod === PAYMENT_METHOD.VNPAY) {
      const res = await processPayment(
        crypto.randomUUID(),
        PAYMENT_METHOD.VNPAY,
        `Thanh toan don dat san ${field.name}`,
      )
      if (res && 'redirectUrl' in res) {
        return
      }
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setStep(2)
  }

  return (
    <Drawer
      className="booking-drawer"
      title={t('booking.flow.drawerTitle')}
      width={520}
      open={open}
      onClose={reset}
    >
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
          <label>
            {t('booking.flow.matchDate')}
            <DatePicker
              value={date}
              onChange={(value) => value && setDate(value)}
              format="DD/MM/YYYY"
              disabledDate={(current) => current.isBefore(dayjs(), 'day')}
            />
          </label>
          <label>
            {t('booking.flow.availableSlots')}
            <Radio.Group
              value={slot}
              onChange={(event) => setSlot(event.target.value)}
              className="time-grid"
            >
              {timeSlots.map((time, index) => (
                <Radio.Button value={time} disabled={index === 1} key={time}>
                  <ClockCircleOutlined /> {time}
                </Radio.Button>
              ))}
            </Radio.Group>
          </label>
          <Alert type="info" showIcon message={t('booking.flow.slotAlert')} />
          <div className="booking-buttons">
            <Button
              type="primary"
              disabled={!slot}
              onClick={() => setStep(1)}
            >
              {t('booking.flow.continue')}
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="booking-step">
          <span className="eyebrow">{t('booking.flow.confirmEyebrow')}</span>
          <h2>{t('booking.flow.confirmTitle')}</h2>
          <div className="booking-summary">
            <h3>{field.name}</h3>
            <p>
              {date.format('dddd, DD/MM/YYYY')} · {slot}
            </p>
            <dl>
              <div>
                <dt>{t('booking.flow.pitchRate')}</dt>
                <dd>{formatPrice(field.pricePerHour)}</dd>
              </div>
            </dl>
          </div>
          <label>
            {t('booking.flow.extraServices')}
            <Checkbox.Group
              value={selectedExtras}
              onChange={(values) => setSelectedExtras(values as string[])}
            >
              {extras.map((extra) => (
                <Checkbox value={extra.name} key={extra.name}>
                  <span>{extra.name}</span>
                  <b>+{formatPrice(extra.price)}</b>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </label>
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
          <div className="booking-buttons">
            <Button onClick={() => setStep(0)} disabled={submitting}>
              {t('booking.flow.back')}
            </Button>
            <Button type="primary" loading={submitting} onClick={confirm}>
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
          subTitle={`${t('booking.flow.bookingCode')} #PM-${bookingCode} · ${date.format('DD/MM/YYYY')} · ${slot}`}
          extra={
            <Button type="primary" onClick={reset}>
              {t('booking.flow.completeBtn')}
            </Button>
          }
        />
      )}
    </Drawer>
  )
}
