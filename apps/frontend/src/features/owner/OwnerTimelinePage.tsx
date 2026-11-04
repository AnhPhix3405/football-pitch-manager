import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, DatePicker, Empty, Select, Spin, Tag } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useOwnerTimeline } from './hooks/useOwnerTimeline'
import type { OwnerCourtTimelineItem, OwnerTimelineSlot } from './interface/owner-booking.types'

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function slotStyle(slot: OwnerTimelineSlot, openMinute: number, span: number) {
  const left = Math.max(0, (timeToMinutes(slot.startTime) - openMinute) / span) * 100
  const right = Math.min(span, timeToMinutes(slot.endTime) - openMinute)
  const width = Math.max(0, (right / span) * 100 - left)
  return { left: `${left}%`, width: `${width}%` }
}

function CourtRow({ court, fieldId, openMinute, span }: { court: OwnerCourtTimelineItem; fieldId: string; openMinute: number; span: number }) {
  const { t } = useTranslation()
  return (
    <div className="owner-timeline__row">
      <div className="owner-timeline__court"><strong>{court.courtName}</strong><small>{court.courtType}v{court.courtType}</small></div>
      <div className="owner-timeline__track">
        {court.bookings.map((booking) => <Link key={`booking-${booking.id}`} className={`owner-timeline__slot owner-timeline__slot--${booking.status || 'confirmed'}`} style={slotStyle(booking, openMinute, span)} to={`/owner/bookings/${booking.id}?fieldId=${fieldId}`} title={`${booking.startTime}–${booking.endTime}`}><b>{booking.startTime}–{booking.endTime}</b><span>{t(`ownerOps.status.${booking.status || 'confirmed'}`, { defaultValue: booking.status || 'confirmed' })}</span></Link>)}
        {court.blockedSlots.map((slot) => <div key={`blocked-${slot.id}`} className="owner-timeline__slot owner-timeline__slot--blocked" style={slotStyle(slot, openMinute, span)} title={slot.reason || ''}><b>{slot.startTime}–{slot.endTime}</b><span>{slot.reason || t('ownerOps.blockedSlot')}</span></div>)}
      </div>
    </div>
  )
}

export function OwnerTimelinePage() {
  const { t } = useTranslation()
  const { fields, fieldId, setFieldId, date, setDate, timeline, loading, error, reload } = useOwnerTimeline()
  const openMinute = timeToMinutes(timeline?.openTime || '06:00')
  const closeMinute = timeToMinutes(timeline?.closeTime || '22:00')
  const span = Math.max(1, closeMinute - openMinute)
  const hours = Array.from({ length: Math.floor(span / 60) + 1 }, (_, index) => openMinute + index * 60)

  return (
    <section className="owner-page">
      <header className="user-page__head"><div><span className="eyebrow">DAILY FIELD OPERATIONS</span><h1>{t('ownerOps.timelineTitle')}</h1><p>{t('ownerOps.timelineSubtitle')}</p></div><Button icon={<ReloadOutlined />} onClick={() => void reload()} loading={loading}>{t('common.refresh')}</Button></header>
      <div className="owner-toolbar">
        <Select value={fieldId || undefined} placeholder={t('ownerOps.chooseField')} onChange={setFieldId} options={fields.map((field) => ({ value: field.id, label: field.name }))} style={{ minWidth: 240 }} />
        <DatePicker value={dayjs(date)} onChange={(value) => value && setDate(value.format('YYYY-MM-DD'))} />
      </div>
      {error && <Alert type="error" showIcon message={error} />}
      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> : timeline ? (
        timeline.isClosed ? <Empty description={t('ownerOps.closedDay')} /> : timeline.courts.length ? (
          <div className="owner-timeline">
            <div className="owner-timeline__ruler"><div /><div className="owner-timeline__hours">{hours.map((minute) => <span key={minute}>{`${String(Math.floor(minute / 60)).padStart(2, '0')}:00`}</span>)}</div></div>
            {timeline.courts.map((court) => <CourtRow key={court.courtId} court={court} fieldId={timeline.fieldId} openMinute={openMinute} span={span} />)}
            <div className="owner-timeline__legend"><Tag color="blue">{t('ownerOps.bookingSlot')}</Tag><Tag color="orange">{t('ownerOps.blockedSlot')}</Tag></div>
          </div>
        ) : <Empty description={t('ownerOps.noCourts')} />
      ) : <Empty description={t('ownerOps.noTimeline')} />}
    </section>
  )
}
