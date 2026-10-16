import { CheckCircleFilled, ClockCircleOutlined, CreditCardOutlined } from '@ant-design/icons'
import { Alert, Button, Checkbox, DatePicker, Drawer, Radio, Result, Steps } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../../fields/field.data'
import type { FootballField } from '../../fields/interface/field.types'

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
  const [slot, setSlot] = useState<string>()
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [bookingCode, setBookingCode] = useState('')

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

  const confirm = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setBookingCode(crypto.randomUUID().slice(0, 6).toUpperCase())
      setSubmitting(false)
      setStep(2)
    }, 800)
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
          <Button
            type="primary"
            block
            size="large"
            disabled={!slot}
            onClick={() => setStep(1)}
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
          <p className="charge-note">
            <CreditCardOutlined /> {t('booking.flow.chargeNote')}
          </p>
          <div className="booking-buttons">
            <Button onClick={() => setStep(0)}>{t('booking.flow.back')}</Button>
            <Button type="primary" loading={submitting} onClick={confirm}>
              {t('booking.flow.confirmBtn')}
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
