import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'notifications' })
@Index(['userId'])
@Index(['userId', 'isRead'])
@Index(['userId', 'createdAt'])
@Index(['userId', 'isRead', 'createdAt'])
export class NotificationEntity extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId!: string | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;
}
