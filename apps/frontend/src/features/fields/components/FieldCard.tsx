import { EnvironmentOutlined, StarFilled } from '@ant-design/icons'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PillButton } from '../../../components/PillButton'
import { formatPrice } from '../field.data'
import type { FootballField } from '../interface/field.types'

export function FieldCard({
  field,
  compact = false,
}: {
  field: FootballField
  compact?: boolean
}) {
  const { t } = useTranslation()
  const fieldLink = `/fields/${field.id}`

  return (
    <article className={`field-card${compact ? ' field-card--compact' : ''}`}>
      <Link className="field-card__image" to={fieldLink}>
        <img src={field.imageUrl} alt={`Sân ${field.name}`} />
        <Tag>{field.format}</Tag>
      </Link>
      <div className="field-card__body">
        <div className="field-card__title">
          <div>
            <h3>
              <Link to={fieldLink}>{field.name}</Link>
            </h3>
            <p>
              <EnvironmentOutlined /> {field.district}, {field.city}
            </p>
          </div>
          <span>
            <StarFilled /> {field.rating}
          </span>
        </div>
        <div className="field-card__tags">
          <Tag>{field.surface}</Tag>
          {field.amenities.slice(0, 2).map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
        <div className="field-card__footer">
          <div>
            <small>{t('common.from')}</small>
            <strong>
              {formatPrice(field.pricePerHour)}
              <em> {t('fields.perHour')}</em>
            </strong>
          </div>
          <Link to={fieldLink}>
            <PillButton
              variant="primary"
              size="sm"
              text={t('fields.viewField')}
            />
          </Link>
        </div>
      </div>
    </article>
  )
}
