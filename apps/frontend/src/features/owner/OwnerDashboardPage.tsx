import {
  ArrowRightOutlined,
  CalendarOutlined,
  DollarOutlined,
  RiseOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { Button, Progress, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { ownerBookings } from './owner.data'

export function OwnerDashboardPage() {
  const { t } = useTranslation()

  const metrics = [
    {
      icon: <DollarOutlined />,
      label: t('owner.metricRevenue'),
      value: '48,6 triệu',
      delta: '+12.4%',
    },
    {
      icon: <CalendarOutlined />,
      label: t('owner.metricBookings'),
      value: '13',
      delta: '86% capacity',
    },
    {
      icon: <ShopOutlined />,
      label: t('owner.metricActive'),
      value: '2 / 3',
      delta: '1 pending',
    },
    {
      icon: <RiseOutlined />,
      label: t('owner.metricUtilization'),
      value: '78%',
      delta: '+6.2%',
    },
  ]

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

      <div className="owner-metrics">
        {metrics.map((item) => (
          <article key={item.label}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
            <em>{item.delta}</em>
          </article>
        ))}
      </div>

      <div className="owner-dashboard-grid">
        <section className="owner-panel">
          <header>
            <h2>{t('owner.recentBookings')}</h2>
            <Link to="/owner/bookings">
              {t('owner.viewAll')} <ArrowRightOutlined />
            </Link>
          </header>
          {ownerBookings.map((booking) => (
            <Link className="owner-booking-row" to={`/owner/bookings/${booking.id}`} key={booking.id}>
              <div>
                <b>{booking.customer}</b>
                <small>
                  {booking.field} · {booking.time}
                </small>
              </div>
              <Tag color={booking.status === 'confirmed' ? 'green' : 'gold'}>{booking.status}</Tag>
              <strong>{formatPrice(booking.amount)}</strong>
            </Link>
          ))}
        </section>

        <section className="owner-panel utilization">
          <header>
            <h2>{t('owner.todayCapacity')}</h2>
          </header>
          <Progress type="dashboard" percent={78} strokeColor="#8cfc70" trailColor="#263125" />
          <p>13 / 17 {t('owner.bookedSlots')}</p>
          <Link to="/owner/bookings">
            <Button block>{t('owner.viewSchedule')}</Button>
          </Link>
        </section>
      </div>
    </section>
  )
}
