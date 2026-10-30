import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  VersionColumn,
} from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'posts' })
@Index(['userId'])
@Index(['status'])
@Index(['playDate'])
@Index(['deletedAt'])
@Index(['status', 'createdAt'])
@Index(['status', 'playDate'])
@Index('IDX_posts_status_playdate_deleted', ['status', 'playDate', 'deletedAt'])
@Index('IDX_posts_user_status_deleted', ['userId', 'status', 'deletedAt'])
@Index(['lat', 'lng'])
@Check(
  'CHK_posts_time_order',
  '"end_time" IS NULL OR "start_time" < "end_time"',
)
@Check('CHK_posts_max_players', '"max_players" > 0')
@Check(
  'CHK_posts_players_count',
  '"current_players" >= 0 AND "current_players" <= "max_players"',
)
@Check(
  'CHK_posts_status',
  "\"status\" IN ('open', 'matched', 'closed', 'cancelled')",
)
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

  @Column({ name: 'current_players', type: 'int', default: 0 })
  currentPlayers!: number;

  @VersionColumn({ default: 1 })
  version!: number;

  @Column({ type: 'varchar', default: 'open' })
  status!: string;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
