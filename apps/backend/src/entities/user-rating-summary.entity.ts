import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_rating_summary' })
@Index(['avgRating'])
@Index(['sportsmanshipScore'])
@Check('"total_reviews" >= 0')
export class UserRatingSummaryEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    name: 'avg_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  avgRating!: string;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews!: number;

  @Column({
    name: 'sportsmanship_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  sportsmanshipScore!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
