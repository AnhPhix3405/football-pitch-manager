import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { ConversationEntity } from './conversation.entity';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'post_matches' })
@Index(['postId', 'applicantId'], { unique: true })
@Index(['postId'])
@Index(['applicantId'])
@Index(['postId', 'status'])
export class PostMatchEntity extends UuidEntity {
  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'post_id' })
  post!: PostEntity;

  @Column({ name: 'applicant_id', type: 'uuid' })
  applicantId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'applicant_id' })
  applicant!: UserEntity;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ name: 'conversation_id', type: 'uuid', nullable: true })
  conversationId!: string | null;

  @ManyToOne(() => ConversationEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: ConversationEntity | null;
}
