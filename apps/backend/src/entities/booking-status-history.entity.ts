import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { BookingEntity } from './booking.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'booking_status_histories' })
@Index('IDX_booking_status_histories_booking', ['bookingId', 'createdAt'])
export class BookingStatusHistoryEntity extends UuidEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId!: string;

  @ManyToOne(() => BookingEntity, (booking) => booking.statusHistories, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'booking_id' })
  booking!: BookingEntity;

  @Column({ name: 'from_status', type: 'varchar', nullable: true })
  fromStatus!: string | null;

  @Column({ name: 'to_status', type: 'varchar' })
  toStatus!: string;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'changed_by' })
  changedByUser!: UserEntity | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;
}
