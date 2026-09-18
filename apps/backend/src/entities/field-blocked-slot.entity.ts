import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldCourtEntity } from './field-court.entity';

@Entity({ name: 'field_blocked_slots' })
@Index(['fieldCourtId'])
@Index(['fieldCourtId', 'blockedDate'])
@Index(['fieldCourtId', 'blockedDate', 'startTime', 'endTime'])
@Check('"start_time" < "end_time"')
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
