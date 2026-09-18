import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';

@Entity({ name: 'field_opening_hours' })
@Index(['fieldId', 'dayOfWeek'], { unique: true })
@Check('"day_of_week" BETWEEN 1 AND 7')
@Check(
  '"is_closed" = true OR ("open_time" IS NOT NULL AND "close_time" IS NOT NULL AND "open_time" < "close_time")',
)
export class FieldOpeningHourEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek!: number;

  @Column({ name: 'open_time', type: 'time', nullable: true })
  openTime!: string | null;

  @Column({ name: 'close_time', type: 'time', nullable: true })
  closeTime!: string | null;

  @Column({ name: 'is_closed', type: 'boolean', default: false })
  isClosed!: boolean;
}
