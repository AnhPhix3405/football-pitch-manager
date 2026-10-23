import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

export type CourtType = '5' | '7' | '11';
export type DayType = 'weekday' | 'weekend' | 'holiday';

@Entity({ name: 'field_pricing' })
@Index('IDX_field_pricing_lookup', ['fieldId', 'courtType', 'dayType'])
@Index('IDX_field_pricing_time_range', [
  'fieldId',
  'courtType',
  'dayType',
  'startTime',
  'endTime',
])
@Check('CHK_field_pricing_court_type', `"court_type" IN ('5', '7', '11')`)
@Check(
  'CHK_field_pricing_day_type',
  `"day_type" IN ('weekday', 'weekend', 'holiday')`,
)
@Check('CHK_field_pricing_time_order', '"start_time" < "end_time"')
@Check('CHK_field_pricing_price_positive', '"price" >= 0')
export class FieldPricingEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ name: 'court_type', type: 'varchar' })
  courtType!: CourtType;

  @Column({ name: 'day_type', type: 'varchar' })
  dayType!: DayType;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price!: string;
}
