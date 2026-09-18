import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_pricing' })
@Index(['fieldId', 'courtType', 'dayType'])
@Index(['fieldId', 'courtType', 'dayType', 'startTime', 'endTime'])
@Check('"start_time" < "end_time"')
@Check('"price" >= 0')
export class FieldPricingEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ name: 'court_type', type: 'varchar' })
  courtType!: string;

  @Column({ name: 'day_type', type: 'varchar' })
  dayType!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price!: string;
}
