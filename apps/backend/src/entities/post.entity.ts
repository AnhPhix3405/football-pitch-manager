import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'posts' })
@Index(['userId'])
@Index(['status'])
@Index(['playDate'])
@Index(['deletedAt'])
@Index(['status', 'createdAt'])
@Index(['status', 'playDate'])
@Index(['lat', 'lng'])
@Check('"end_time" IS NULL OR "start_time" < "end_time"')
@Check('"max_players" > 0')
export class PostEntity extends UuidEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng!: string | null;

  @Column({ name: 'play_date', type: 'date' })
  playDate!: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime!: string | null;

  @Column({ name: 'skill_level_required', type: 'varchar', nullable: true })
  skillLevelRequired!: string | null;

  @Column({ name: 'max_players', type: 'int' })
  maxPlayers!: number;

  @Column({ type: 'varchar', default: 'open' })
  status!: string;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
