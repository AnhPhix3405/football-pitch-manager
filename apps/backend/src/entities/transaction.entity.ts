import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'transactions' })
@Index(['userId'])
@Index(['refId'])
@Index(['status'])
@Index(['gatewayRef'])
@Index(['userId', 'createdAt'])
@Index(['type', 'refId'])
@Check('"amount" >= 0')
export class TransactionEntity extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ name: 'ref_id', type: 'uuid' })
  refId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  gateway!: string | null;

  @Column({ name: 'gateway_ref', type: 'varchar', nullable: true })
  gatewayRef!: string | null;
}
