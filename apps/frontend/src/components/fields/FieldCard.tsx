import { EnvironmentOutlined, StarFilled } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../features/fields/field.data'
import type { FootballField } from '../../features/fields/field.types'

export function FieldCard({ field, compact = false }: { field: FootballField; compact?: boolean }) {
  return (
    <article className={`field-card${compact ? ' field-card--compact' : ''}`}>
      <Link className="field-card__image" to={`/fields/${field.id}`}><img src={field.imageUrl} alt={`Sân ${field.name}`} /><Tag>{field.format}</Tag></Link>
      <div className="field-card__body"><div className="field-card__title"><div><h3><Link to={`/fields/${field.id}`}>{field.name}</Link></h3><p><EnvironmentOutlined /> {field.district}, {field.city}</p></div><span><StarFilled /> {field.rating}</span></div><div className="field-card__tags"><Tag>{field.surface}</Tag>{field.amenities.slice(0, 2).map((item) => <Tag key={item}>{item}</Tag>)}</div><div className="field-card__footer"><div><small>TỪ</small><strong>{formatPrice(field.pricePerHour)}<em>/giờ</em></strong></div><Link to={`/fields/${field.id}`}><Button type="primary">Xem sân</Button></Link></div></div>
    </article>
  )
}
