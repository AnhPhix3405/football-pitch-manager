import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_profiles' })
export class UserProfileEntity extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'full_name', type: 'varchar', nullable: true })
  fullName!: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'skill_level', type: 'varchar', nullable: true })
  skillLevel!: string | null;

  @Column({ type: 'date', nullable: true })
  birthday!: string | null;

  @Column({ type: 'varchar', nullable: true })
  gender!: string | null;
}
