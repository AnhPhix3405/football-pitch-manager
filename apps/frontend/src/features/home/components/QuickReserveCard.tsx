import { CalendarOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../fields/field.data'
import type { FootballField } from '../../fields/interface/field.types'

interface QuickReserveCardProps {
  field: FootballField
}

export function QuickReserveCard({ field }: QuickReserveCardProps) {
  const { t } = useTranslation()

  // Default demo slot choices
  const dates = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Ngày mai', value: 'tomorrow' },
  ]

  const [selectedDate, setSelectedDate] = useState('today')

  return (
    <div className="quick-reserve-card">
      <div className="quick-reserve-card__glow" />

      <div className="quick-reserve-card__header">
        <div>
          <span className="quick-reserve-card__badge">{t('home.reserveBadge')}</span>
          <h3 className="quick-reserve-card__title">{field.name}</h3>
        </div>
        <Link
          to={`/fields/${field.id}`}
          className="quick-reserve-card__link-icon"
          aria-label={t('fields.viewDetails', { defaultValue: 'Chi tiết sân' })}
        >
          <RightOutlined />
        </Link>
      </div>

      <div className="quick-reserve-card__dates">
        {dates.map((d) => (
          <button
            key={d.value}
            type="button"
            className={`quick-reserve-card__date-pill ${selectedDate === d.value ? 'active' : ''}`}
            onClick={() => setSelectedDate(d.value)}
          >
            <CalendarOutlined />
            <span>{d.label}</span>
          </button>
        ))}
      </div>

      <div className="quick-reserve-card__details">
        <div className="quick-reserve-card__detail-item">
          <small>{t('home.reserveCheckIn')}</small>
          <strong>
            <ClockCircleOutlined /> {t('home.reserveCheckInValue')}
          </strong>
        </div>
        <div className="quick-reserve-card__detail-item">
          <small>{t('home.reserveDuration')}</small>
          <strong>{t('home.reserveDurationValue')}</strong>
        </div>
      </div>

      <div className="quick-reserve-card__pricing">
        <div className="quick-reserve-card__price-wrapper">
          <span className="quick-reserve-card__price-val">{formatPrice(field.pricePerHour)}</span>
          <span className="quick-reserve-card__price-unit">{t('home.reservePriceUnit')}</span>
        </div>
        <span className="quick-reserve-card__capacity">{field.format} · 10-14 cầu thủ</span>
      </div>

      <Link to={`/fields/${field.id}`} className="quick-reserve-card__action-link">
        <Button className="quick-reserve-card__action-btn" size="large" block>
          {t('home.reserveActionBtn')}
        </Button>
      </Link>
    </div>
  )
}
