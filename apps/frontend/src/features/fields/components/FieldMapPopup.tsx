import { memo } from 'react'
import { EnvironmentOutlined, StarFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PillButton } from '~/components/PillButton'
import { DEFAULT_FIELD_FALLBACK_IMAGE, formatPrice } from '../field.data'
import type { FootballField } from '../interface/field.types'

export interface FieldMapPopupProps {
  field: FootballField
  onViewDetail?: () => void
}

export const FieldMapPopup = memo(function FieldMapPopup({
  field,
  onViewDetail,
}: FieldMapPopupProps) {
  const { t } = useTranslation()
  const isOnline = field.hasOwnerAccount

  return (
    <div className="pitch-glass-popup">
      {/* 1. Header trên cùng theo bố cục ảnh: Avatar + Headline + Subhead + Right Icon/Badge */}
      <div className="pitch-glass-popup__header">
        <div className="pitch-glass-popup__header-left">
          <div className="pitch-glass-popup__avatar">
            <img
              src={field.imageUrl || DEFAULT_FIELD_FALLBACK_IMAGE}
              alt={field.name}
            />
          </div>
          <div className="pitch-glass-popup__titles">
            <h5 className="pitch-glass-popup__headline">{field.name}</h5>
            <span className="pitch-glass-popup__subhead">
              <EnvironmentOutlined /> {field.district}, {field.city}
            </span>
          </div>
        </div>

        <div className="pitch-glass-popup__header-badge">
          <span className="pitch-glass-popup__rating-badge">
            <StarFilled /> {Number(field.rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* 2. Media Image Banner ở giữa */}
      <div className="pitch-glass-popup__media">
        <img
          src={field.imageUrl || DEFAULT_FIELD_FALLBACK_IMAGE}
          alt={field.name}
          className="pitch-glass-popup__banner"
          loading="lazy"
        />
        <div className="pitch-glass-popup__media-tags">
          <span className="pitch-glass-popup__format-tag">{field.format}</span>
          {isOnline ? (
            <span className="pitch-glass-popup__online-tag">
              ⚡ {t('fields.onlineBookingBadge', { defaultValue: 'ĐẶT ONLINE' })}
            </span>
          ) : (
            <span className="pitch-glass-popup__ref-tag">
              {t('fields.referenceOnlyBadge', { defaultValue: 'THAM KHẢO' })}
            </span>
          )}
        </div>
      </div>

      {/* 3. Nội dung: Title, Subtitle (Giá), Description (Địa chỉ & tiện ích) */}
      <div className="pitch-glass-popup__body">
        <div className="pitch-glass-popup__info-head">
          <h4 className="pitch-glass-popup__title">{field.name}</h4>
          <div className="pitch-glass-popup__price">
            <strong>{formatPrice(field.pricePerHour)}</strong>
            <small>{t('fields.perHour', { defaultValue: '/ giờ' })}</small>
          </div>
        </div>

        <p className="pitch-glass-popup__description">
          {field.address}
        </p>

        {field.amenities && field.amenities.length > 0 && (
          <div className="pitch-glass-popup__amenities">
            <span className="pitch-glass-popup__amenity-pill">{field.surface}</span>
            {field.amenities.slice(0, 2).map((item) => (
              <span key={item} className="pitch-glass-popup__amenity-pill">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 4. Nút bấm căn phải ở đáy */}
      <div className="pitch-glass-popup__actions">
        <PillButton
          variant="primary"
          size="sm"
          onClick={onViewDetail}
          text={t('fields.viewDetails', { defaultValue: 'Xem chi tiết' })}
          className="pitch-glass-popup__btn-primary"
        />
      </div>
    </div>
  )
})
