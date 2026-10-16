import { CalendarOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Modal, Segmented, Tag, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import type { BookingStatus } from '../user/user.data'
import { useBookings, type BookingFilterType } from './hooks/useBookings'

export function MyBookingsPage() {
  const { t } = useTranslation()
  const { filter, setFilter, visible, cancel } = useBookings()
  const [messageApi, contextHolder] = message.useMessage()

  const statusLabels: Record<BookingStatus, string> = {
    confirmed: t('booking.status.confirmed'),
    pending: t('booking.status.pending'),
    completed: t('booking.status.completed'),
    cancelled: t('booking.status.cancelled'),
  }

  const handleCancelConfirm = (id: string) =>
    Modal.confirm({
      title: t('booking.cancelModal.title'),
      content: t('booking.cancelModal.content'),
      okText: t('booking.cancelModal.ok'),
      okButtonProps: { danger: true },
      cancelText: t('booking.cancelModal.cancel'),
      onOk: () => {
        cancel(id)
        messageApi.success(t('booking.cancelModal.success'))
      },
    })

  return (
    <section className="user-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">{t('booking.eyebrow')}</span>
          <h1>{t('booking.title')}</h1>
          <p>{t('booking.subtitle')}</p>
        </div>
        <Link to="/app/fields">
          <Button type="primary" icon={<PlusOutlined />}>
            {t('booking.newBooking')}
          </Button>
        </Link>
      </header>

      <Segmented
        block
        value={filter}
        onChange={(val) => setFilter(val as BookingFilterType)}
        options={[
          { value: 'upcoming', label: t('booking.tabs.upcoming') },
          { value: 'pending', label: t('booking.tabs.pending') },
          { value: 'history', label: t('booking.tabs.history') },
        ]}
      />

      {visible.length ? (
        <div className="booking-card-grid">
          {visible.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div className="booking-card__visual">
                <img src={booking.image} alt={booking.field} />
                <Tag>{statusLabels[booking.status]}</Tag>
              </div>
              <div className="booking-card__body">
                <h2>{booking.field}</h2>
                <p>
                  <EnvironmentOutlined /> {booking.location}
                </p>
                <dl>
                  <div>
                    <dt>{t('booking.card.dateTime')}</dt>
                    <dd>
                      <CalendarOutlined /> {booking.date}
                      <br />
                      {booking.time}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('booking.card.total')}</dt>
                    <dd className="lime">{formatPrice(booking.price)}</dd>
                  </div>
                </dl>
                <div>
                  <Button>{t('booking.card.viewDetails')}</Button>
                  {booking.status === 'confirmed' && (
                    <Button danger onClick={() => handleCancelConfirm(booking.id)}>
                      {t('booking.card.cancel')}
                    </Button>
                  )}
                  {booking.status === 'pending' && (
                    <Button type="primary">{t('booking.card.payDeposit')}</Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty description={t('booking.card.empty')} />
      )}
    </section>
  )
}
