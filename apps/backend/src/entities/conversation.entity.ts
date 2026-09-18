import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { FieldEntity } from './field.entity';
import { PostEntity } from './post.entity';

@Entity({ name: 'conversations' })
@Index(['relatedPostId'])
@Index(['relatedFieldId'])
export class ConversationEntity extends UuidEntity {
  @Column({ type: 'varchar', default: 'direct' })
  type!: string;

  @Column({ name: 'related_post_id', type: 'uuid', nullable: true })
  relatedPostId!: string | null;

  @ManyToOne(() => PostEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'related_post_id' })
  relatedPost!: PostEntity | null;

  @Column({ name: 'related_field_id', type: 'uuid', nullable: true })
  relatedFieldId!: string | null;

  @ManyToOne(() => FieldEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'related_field_id' })
  relatedField!: FieldEntity | null;
}
