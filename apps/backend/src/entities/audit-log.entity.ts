import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'audit_logs' })
@Index('idx_audit_logs_action_created_at', ['action', 'createdAt'])
@Index('idx_audit_logs_category_created_at', ['category', 'createdAt'])
@Index('idx_audit_logs_actor_id_created_at', ['actorId', 'createdAt'])
@Index('idx_audit_logs_target_type_id', ['targetType', 'targetId'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId!: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor?: UserEntity | null;

  @Column({ name: 'actor_email', type: 'varchar', length: 255, nullable: true })
  actorEmail!: string | null;

  @Column({ name: 'actor_role', type: 'varchar', length: 50, default: 'admin' })
  actorRole!: string;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'varchar', length: 50 })
  category!: string;

  @Column({ name: 'target_type', type: 'varchar', length: 50, nullable: true })
  targetType!: string | null;

  @Column({ name: 'target_id', type: 'varchar', length: 100, nullable: true })
  targetId!: string | null;

  @Column({ name: 'target_name', type: 'varchar', length: 255, nullable: true })
  targetName!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details!: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
