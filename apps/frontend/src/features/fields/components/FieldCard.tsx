import { EnvironmentOutlined, StarFilled } from '@ant-design/icons'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PillButton } from '../../../components/PillButton'
import { DEFAULT_FIELD_FALLBACK_IMAGE, formatPrice } from '../field.data'
import type { FootballField } from '../interface/field.types'

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
    if (target.src !== DEFAULT_FIELD_FALLBACK_IMAGE) target.src = DEFAULT_FIELD_FALLBACK_IMAGE
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
