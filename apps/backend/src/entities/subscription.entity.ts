import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { SubscriptionPlanEntity } from './subscription-plan.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'subscriptions' })
@Index(['ownerId'])
@Index(['planId'])
@Index(['status'])
@Index(['ownerId', 'status'])
@Index(['status', 'endDate'])
export class SubscriptionEntity extends UuidEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => SubscriptionPlanEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'plan_id' })
  plan!: SubscriptionPlanEntity;

  @Column({ type: 'varchar', default: 'pending_payment' })
  status!: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null;
}
