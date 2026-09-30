import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'auth_sessions' })
@Index('idx_auth_sessions_user_id', ['userId'])
@Index('idx_auth_sessions_expires_at', ['expiresAt'])
@Index('idx_auth_sessions_is_revoked', ['isRevoked'])
export class AuthSessionEntity extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 64 })
  refreshTokenHash!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked!: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;
}
