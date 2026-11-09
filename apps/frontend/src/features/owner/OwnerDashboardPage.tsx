import { ArrowRightOutlined, CalendarOutlined, DollarOutlined, RiseOutlined, ShopOutlined } from '@ant-design/icons'
import { Alert, Button, Empty, Progress, Spin, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useOwnerDashboard } from '../../hooks/useOwnerDashboard'
import { formatPrice } from '../fields/field.data'

export function OwnerDashboardPage() {
  const { t, i18n } = useTranslation()
  const { stats, error, retry } = useOwnerDashboard()
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const unavailable = t('owner.dashboard.unavailable')

  return (
    <section className="owner-page">
      <header className="user-page__head">
        <div>
          <span className="eyebrow">{t('owner.eyebrow')}</span>
          <h1>{t('owner.title')}</h1>
          <p>{t('owner.subtitle')}</p>
        </div>
        <Link to="/owner/fields/new">
          <Button type="primary">{t('owner.addField')}</Button>
        </Link>
      </header>

      {error && (
        <Alert type="error" showIcon title={t('owner.dashboard.loadError')}
          action={<Button onClick={retry}>{t('common.retry')}</Button>} />
      )}
      {!stats && !error && <Spin aria-label={t('common.loading')} />}
      {stats && (
        <>
          <div className="owner-metrics">
            <article>
              <span><DollarOutlined /></span>
              <small>{t('owner.metricRevenue')}</small>
              <strong>{formatPrice(stats.monthlyRevenue)}</strong>
            </article>
            <article>
              <span><CalendarOutlined /></span>
              <small>{t('owner.metricBookings')}</small>
              <strong>{number.format(stats.todayBookings)}</strong>
            </article>
            <article>
              <span><ShopOutlined /></span>
              <small>{t('owner.metricActive')}</small>
              <strong>{number.format(stats.activeFields)} / {number.format(stats.totalFields)}</strong>
            </article>
            <article>
              <span><RiseOutlined /></span>
              <small>{t('owner.metricUtilization')}</small>
              <strong>{stats.utilizationPercent === null ? unavailable : `${number.format(stats.utilizationPercent)}%`}</strong>
            </article>
          </div>

          <div className="owner-dashboard-grid">
            <section className="owner-panel">
              <header>
                <h2>{t('owner.recentBookings')}</h2>
                <Link to="/owner/bookings">
                  {t('owner.viewAll')} <ArrowRightOutlined />
                </Link>
              </header>
              {stats.recentBookings.length === 0 && <Empty description={t('owner.dashboard.noRecentBookings')} />}
              {stats.recentBookings.map((booking) => (
                <Link className="owner-booking-row" to={`/owner/bookings/${booking.id}?fieldId=${booking.fieldId}`} key={booking.id}>
                  <div>
                    <b>{booking.fieldName || booking.id}</b>
                    <small>
                      {booking.courtName || `${booking.requestedCourtType}v${booking.requestedCourtType}`} · {booking.bookingDate} · {booking.startTime}–{booking.endTime}
                    </small>
                  </div>
                  <Tag color={booking.status === 'confirmed' || booking.status === 'completed' ? 'green' : 'gold'}>{t(`ownerOps.status.${booking.status}`)}</Tag>
                  <strong>{formatPrice(booking.totalPrice)}</strong>
                </Link>
              ))}
            </section>

            <section className="owner-panel utilization">
              <header>
                <h2>{t('owner.todayCapacity')}</h2>
              </header>
              {stats.utilizationPercent === null ? (
                <p>{t('owner.dashboard.noCapacity')}</p>
              ) : (
                <>
                  <Progress type="dashboard" percent={stats.utilizationPercent} strokeColor="#8cfc70" />
                  <p>{t('owner.dashboard.capacityMinutes', {
                    booked: number.format(stats.bookedMinutes),
                    available: number.format(stats.availableMinutes),
                  })}</p>
                </>
              )}
              <Link to="/owner/timeline">
                <Button block>{t('owner.viewSchedule')}</Button>
              </Link>
            </section>
          </div>
        </>
      )}
    </section>
  )
}
