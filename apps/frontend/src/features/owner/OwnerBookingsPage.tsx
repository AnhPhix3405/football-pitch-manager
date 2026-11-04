import { CalendarOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Alert, Button, DatePicker, Empty, Input, Select, Spin, Table, Tag } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { useOwnerBookings } from './hooks/useOwnerBookings'

export function OwnerBookingsPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [date, setDate] = useState<Dayjs | null>(null)
  const { fields, fieldId, setFieldId, bookings, loading, error, reload } = useOwnerBookings(
    status,
    date?.format('YYYY-MM-DD'),
  )
  const visible = useMemo(() => bookings.filter((booking) =>
    !query || `${booking.id} ${booking.fieldName ?? ''} ${booking.courtName ?? ''}`
      .toLowerCase().includes(query.trim().toLowerCase()),
  ), [bookings, query])
  const statusLabel = (value: string) => t(`ownerOps.status.${value}`, { defaultValue: value })

  return (
    <section className="owner-page">
      <header className="user-page__head">
        <div><span className="eyebrow">RESERVATION CONTROL</span><h1>{t('ownerOps.bookingsTitle')}</h1><p>{t('ownerOps.bookingsSubtitle')}</p></div>
        <Button icon={<ReloadOutlined />} onClick={() => void reload()} loading={loading}>{t('common.refresh')}</Button>
      </header>
      {error && <Alert type="error" showIcon message={error} />}
      <div className="owner-toolbar">
        <Select
          value={fieldId || undefined}
          placeholder={t('ownerOps.chooseField')}
          onChange={setFieldId}
          options={fields.map((field) => ({ value: field.id, label: field.name }))}
          style={{ minWidth: 220 }}
        />
        <Input prefix={<SearchOutlined />} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('ownerOps.searchBooking')} />
        <DatePicker value={date} onChange={setDate} placeholder={t('ownerOps.filterDate')} />
        <Select
          value={status}
          onChange={setStatus}
          options={['all', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed'].map((value) => ({
            value,
            label: value === 'all' ? t('ownerOps.allStatuses') : statusLabel(value),
          }))}
        />
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div> : (
        <Table
          rowKey="id"
          dataSource={visible}
          scroll={{ x: 850 }}
          locale={{ emptyText: <Empty description={t('ownerOps.noBookings')} /> }}
          columns={[
            { title: t('ownerOps.bookingColumn'), render: (_, item) => <Link to={`/owner/bookings/${item.id}?fieldId=${fieldId}`}><b>{item.id}</b><small className="table-sub">{item.courtName || `${t('ownerOps.courtType')} ${item.requestedCourtType}v${item.requestedCourtType === '5' ? '5' : item.requestedCourtType}`}</small></Link> },
            { title: t('ownerOps.dateColumn'), render: (_, item) => <><CalendarOutlined /> {dayjs(item.bookingDate).format('DD/MM/YYYY')}<small className="table-sub">{item.startTime} – {item.endTime}</small></> },
            { title: t('ownerOps.amountColumn'), render: (_, item) => formatPrice(item.totalPrice) },
            { title: t('ownerOps.statusColumn'), render: (_, item) => <Tag color={item.status === 'confirmed' || item.status === 'completed' ? 'green' : item.status === 'rejected' || item.status === 'cancelled' ? 'red' : 'gold'}>{statusLabel(item.status)}</Tag> },
          ]}
        />
      )}
    </section>
  )
}
