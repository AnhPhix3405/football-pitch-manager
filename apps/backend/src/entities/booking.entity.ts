import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldCourtEntity } from './field-court.entity';
import { FieldEntity } from './field.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'bookings' })
@Index(['userId'])
@Index(['fieldId'])
@Index(['fieldCourtId'])
@Index(['bookingDate'])
@Index(['status'])
@Index(['userId', 'createdAt'])
@Index(['fieldId', 'bookingDate'])
@Index(['fieldCourtId', 'bookingDate'])
@Index(['fieldCourtId', 'bookingDate', 'startTime', 'endTime'])
@Check('"start_time" < "end_time"')
@Check('"total_price" >= 0')
@Check('"deposit_amount" >= 0')
export class BookingEntity extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ name: 'requested_court_type', type: 'varchar' })
  requestedCourtType!: string;

  @Column({ name: 'field_court_id', type: 'uuid', nullable: true })
  fieldCourtId!: string | null;

  @ManyToOne(() => FieldCourtEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'field_court_id' })
  fieldCourt!: FieldCourtEntity | null;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2 })
  totalPrice!: string;

  @Column({ name: 'payment_method', type: 'varchar', nullable: true })
  paymentMethod!: string | null;

  @Column({ name: 'payment_status', type: 'varchar', default: 'unpaid' })
  paymentStatus!: string;

  @Column({
    name: 'deposit_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    default: 0,
  })
  depositAmount!: string | null;

  @Column({ name: 'owner_note', type: 'text', nullable: true })
  ownerNote!: string | null;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'cancelled_by' })
  cancelledByUser!: UserEntity | null;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason!: string | null;
}
