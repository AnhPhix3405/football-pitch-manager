import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_reviews' })
@Index(['postId', 'targetUserId', 'reviewerId'], { unique: true })
@Index(['targetUserId'])
@Index(['reviewerId'])
@Index(['targetUserId', 'createdAt'])
@Check('"rating" BETWEEN 1 AND 5')
export class UserReviewEntity extends UuidEntity {
  @Column({ name: 'target_user_id', type: 'uuid' })
  targetUserId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'target_user_id' })
  targetUser!: UserEntity;

  @Column({ name: 'reviewer_id', type: 'uuid' })
  reviewerId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: UserEntity;

  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string;

  @ManyToOne(() => PostEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ name: 'is_flagged', type: 'boolean', default: false })
  isFlagged!: boolean;
}
