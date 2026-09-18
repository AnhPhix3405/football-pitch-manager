import { Check, Column, Entity } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';

@Entity({ name: 'subscription_plans' })
@Check('"price" >= 0')
@Check('"duration_days" > 0')
export class SubscriptionPlanEntity extends UuidEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price!: string;

  @Column({ name: 'duration_days', type: 'int' })
  durationDays!: number;

  @Column({ type: 'json', nullable: true })
  benefit!: Record<string, unknown> | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
