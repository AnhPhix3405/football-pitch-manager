import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldCourtEntity } from './field-court.entity';

@Entity({ name: 'field_blocked_slots' })
@Index('IDX_field_blocked_slots_court_id', ['fieldCourtId'])
@Index('IDX_field_blocked_slots_court_date', ['fieldCourtId', 'blockedDate'])
@Index('IDX_field_blocked_slots_court_date_time', [
  'fieldCourtId',
  'blockedDate',
  'startTime',
  'endTime',
])
@Check('CHK_field_blocked_slots_time_range', '"start_time" < "end_time"')
export class FieldBlockedSlotEntity extends UuidEntity {
  @Column({ name: 'field_court_id', type: 'uuid' })
  fieldCourtId!: string;

  @ManyToOne(() => FieldCourtEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'field_court_id' })
  fieldCourt!: FieldCourtEntity;

  @Column({ name: 'blocked_date', type: 'date' })
  blockedDate!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ type: 'varchar', nullable: true })
  reason!: string | null;
}
