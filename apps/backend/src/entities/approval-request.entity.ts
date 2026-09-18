import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'approval_requests' })
@Index(['requestedBy'])
@Index(['reviewedBy'])
@Index(['status'])
@Index(['type', 'targetId'])
@Index(['status', 'createdAt'])
export class ApprovalRequestEntity extends UuidEntity {
  @Column({ type: 'varchar' })
  type!: string;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId!: string;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'requested_by' })
  requester!: UserEntity;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string | null;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer!: UserEntity | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;
}
