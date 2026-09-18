import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'ai_usage_logs' })
@Index(['userId'])
@Index(['feature'])
@Index(['userId', 'createdAt'])
@Index(['userId', 'feature', 'createdAt'])
@Check('"tokens_used" >= 0')
export class AiUsageLogEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar' })
  feature!: string;

  @Column({ name: 'tokens_used', type: 'int', default: 0 })
  tokensUsed!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
