import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'post_comments' })
@Index(['postId'])
@Index(['userId'])
@Index(['postId', 'createdAt'])
export class PostCommentEntity extends UuidEntity {
  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'text' })
  content!: string;
}
