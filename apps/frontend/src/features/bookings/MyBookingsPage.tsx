import { PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Modal, Segmented, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useBookings, type BookingFilterType } from './hooks/useBookings'
import { BookingCard } from './components/BookingCard'

export function MyBookingsPage() {
  const { t } = useTranslation()
  const { filter, setFilter, visible, cancel } = useBookings()
  const [messageApi, contextHolder] = message.useMessage()

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
        <Link to="/fields">
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
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelConfirm}
            />
          ))}
        </div>
      ) : (
        <Empty description={t('booking.card.empty')} />
      )}
    </section>
  )
}
