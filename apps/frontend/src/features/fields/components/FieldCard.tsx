import { EnvironmentOutlined, StarFilled } from '@ant-design/icons'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PillButton } from '../../../components/PillButton'
import { DEFAULT_FIELD_FALLBACK_IMAGE, formatPrice } from '../field.data'
import type { FootballField } from '../interface/field.types'

// Inline SVG fallback icon placeholder
const SVG_FALLBACK_DATA =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%2311162b"><rect width="400" height="300" fill="%23141a33"/><circle cx="200" cy="150" r="50" stroke="%238cfc70" stroke-width="2" fill="none" opacity="0.4"/><line x1="20" y1="150" x2="380" y2="150" stroke="%238cfc70" stroke-width="2" opacity="0.3"/><rect x="20" y="20" width="360" height="260" rx="8" stroke="%238cfc70" stroke-width="2" fill="none" opacity="0.3"/><text x="50%" y="54%" text-anchor="middle" fill="%238cfc70" font-family="sans-serif" font-size="16" font-weight="bold">PitchMaster Arena</text></svg>'

export interface FieldCardProps {
  field: FootballField
  compact?: boolean
  isSelected?: boolean
  onSelect?: (field: FootballField) => void
  onHover?: (field: FootballField | null) => void
}

export function FieldCard({
  field,
  compact = false,
  isSelected = false,
  onSelect,
  onHover,
}: FieldCardProps) {
  const { t } = useTranslation()
  const fieldLink = `/fields/${field.id}`

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget
    if (target.src !== DEFAULT_FIELD_FALLBACK_IMAGE) {
      target.src = DEFAULT_FIELD_FALLBACK_IMAGE
    } else {
      target.src = SVG_FALLBACK_DATA
    }
  }

  return (
    <article
      className={`field-card${compact ? ' field-card--compact' : ''}${
        isSelected ? ' field-card--selected' : ''
      }`}
      onClick={() => onSelect?.(field)}
      onMouseEnter={() => onHover?.(field)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link className="field-card__image" to={fieldLink}>
        <img
          src={field.imageUrl || DEFAULT_FIELD_FALLBACK_IMAGE}
          alt={`Sân ${field.name}`}
          onError={handleImageError}
          loading="lazy"
        />
        <div className="field-card__badges">
          <span className="field-card__badge-format">{field.format}</span>
          {field.hasOwnerAccount ? (
            <span className="field-card__badge-status field-card__badge-status--online">
              ⚡ {t('fields.onlineBookingBadge', { defaultValue: 'ĐẶT ONLINE' })}
            </span>
          ) : (
            <span className="field-card__badge-status field-card__badge-status--ref">
              {t('fields.referenceOnlyBadge', { defaultValue: 'THAM KHẢO' })}
            </span>
          )}
        </div>
      </Link>
      <div className="field-card__body">
        <div className="field-card__title">
          <div>
            <h3>
              <Link to={fieldLink}>{field.name}</Link>
            </h3>
            <p className="field-card__location">
              <EnvironmentOutlined /> {field.district}, {field.city}
            </p>
          </div>
          <span className="field-card__rating">
            <StarFilled /> {Number(field.rating).toFixed(1)}
          </span>
        </div>
        <div className="field-card__tags">
          <Tag>{field.surface}</Tag>
          {field.amenities.slice(0, 2).map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
        <div className="field-card__footer">
          <div className="field-card__price-wrap">
            <small>{t('common.from', { defaultValue: 'Từ' })}</small>
            <strong>
              {formatPrice(field.pricePerHour)}
              <em> {t('fields.perHour', { defaultValue: '/ giờ' })}</em>
            </strong>
          </div>
          <Link to={fieldLink} onClick={(e) => e.stopPropagation()}>
            <PillButton
              variant={field.hasOwnerAccount ? 'primary' : 'secondary'}
              size="sm"
              text={
                field.hasOwnerAccount
                  ? t('fields.bookNow', { defaultValue: 'Đặt sân ngay' })
                  : t('fields.viewInfo', { defaultValue: 'Xem thông tin' })
              }
            />
          </Link>
        </div>
      </div>
    </article>
  )
}
