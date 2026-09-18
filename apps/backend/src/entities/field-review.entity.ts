import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { BookingEntity } from './booking.entity';
import { FieldEntity } from './field.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'field_reviews' })
@Index(['bookingId', 'reviewerId'], { unique: true })
@Index(['fieldId'])
@Index(['reviewerId'])
@Index(['fieldId', 'createdAt'])
@Check('"rating" BETWEEN 1 AND 5')
export class FieldReviewEntity extends UuidEntity {
  @Column({ name: 'field_id', type: 'uuid' })
  fieldId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  reviewerId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: UserEntity;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId!: string;

  @ManyToOne(() => BookingEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'booking_id' })
  booking!: BookingEntity;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ name: 'is_flagged', type: 'boolean', default: false })
  isFlagged!: boolean;
}
