import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UuidEntity } from '../core/entities/uuid.entity';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'messages' })
@Index(['conversationId'])
@Index(['senderId'])
@Index(['conversationId', 'createdAt'])
export class MessageEntity extends UuidEntity {
  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId!: string;

  @ManyToOne(() => ConversationEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: ConversationEntity;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'sender_id' })
  sender!: UserEntity;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ name: 'message_type', type: 'varchar', default: 'text' })
  messageType!: string;
}
