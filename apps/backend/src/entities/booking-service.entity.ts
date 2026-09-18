import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { BookingEntity } from './booking.entity';
import { FieldServiceEntity } from './field-service.entity';

@Entity({ name: 'booking_services' })
@Index(['bookingId', 'serviceId'], { unique: true })
@Index(['bookingId'])
@Check('"quantity" > 0')
@Check('"price_snapshot" >= 0')
export class BookingServiceEntity extends UuidEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId!: string;

  @ManyToOne(() => BookingEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'booking_id' })
  booking!: BookingEntity;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId!: string;

  @ManyToOne(() => FieldServiceEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'service_id' })
  service!: FieldServiceEntity;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ name: 'price_snapshot', type: 'decimal', precision: 15, scale: 2 })
  priceSnapshot!: string;
}
