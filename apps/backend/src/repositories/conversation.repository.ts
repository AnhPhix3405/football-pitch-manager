import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { ConversationMemberEntity } from '~/entities/conversation-member.entity';
import { ConversationEntity } from '~/entities/conversation.entity';
import { FieldEntity } from '~/entities/field.entity';
import { MessageEntity } from '~/entities/message.entity';
import { PostEntity } from '~/entities/post.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';

export interface ConversationSummaryItem {
  id: string;
  type: string;
  name: string;
  avatarUrl: string | null;
  online: boolean;
  unreadCount: number;
  kind: 'field' | 'team';
  relatedFieldId: string | null;
  relatedPostId: string | null;
  lastMessage: {
    id: string;
    content: string | null;
    senderId: string;
    createdAt: Date;
  } | null;
  updatedAt: Date;
}

@Injectable()
export class ConversationRepository extends BaseRepository<ConversationEntity> {
  constructor(
    @InjectRepository(ConversationEntity)
    repository: Repository<ConversationEntity>,
    @InjectRepository(ConversationMemberEntity)
    private readonly memberRepository: Repository<ConversationMemberEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  async isMember(conversationId: string, userId: string): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: {
        conversationId,
        userId,
        deletedAt: IsNull(),
      },
    });
    return !!member;
  }

  async getUserConversations(
    userId: string,
  ): Promise<ConversationSummaryItem[]> {
    const memberships = await this.memberRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: {
        conversation: {
          relatedField: true,
          relatedPost: true,
        },
      },
      order: {
        joinedAt: 'DESC',
      },
    });

    if (memberships.length === 0) {
      return [];
    }

    const conversationIds = memberships.map((m) => m.conversationId);

    // Get other members for these conversations
    const allOtherMembers = await this.memberRepository.find({
      where: {
        conversationId: In(conversationIds),
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    // Get profiles for other members
    const otherUserIds = Array.from(
      new Set(
        allOtherMembers.filter((m) => m.userId !== userId).map((m) => m.userId),
      ),
    );

    const userProfiles =
      otherUserIds.length > 0
        ? await this.userProfileRepository.find({
            where: { userId: In(otherUserIds) },
          })
        : [];

    const profileMap = new Map<string, UserProfileEntity>();
    for (const p of userProfiles) {
      profileMap.set(p.userId, p);
    }

    // Get latest messages for each conversation
    const messages = await this.messageRepository
      .createQueryBuilder('m')
      .where('m.conversation_id IN (:...conversationIds)', { conversationIds })
      .andWhere('m.deleted_at IS NULL')
      .orderBy('m.created_at', 'DESC')
      .getMany();

    const latestMessageMap = new Map<string, MessageEntity>();
    for (const msg of messages) {
      if (!latestMessageMap.has(msg.conversationId)) {
        latestMessageMap.set(msg.conversationId, msg);
      }
    }

    const result: ConversationSummaryItem[] = [];

    for (const membership of memberships) {
      const conv = membership.conversation;
      if (!conv) continue;

      const lastMsg = latestMessageMap.get(conv.id) ?? null;

      // Unread count: messages where senderId != userId and created_at > lastReadAt
      const lastRead = membership.lastReadAt ?? membership.joinedAt;
      const unreadCount = messages.filter(
        (m) =>
          m.conversationId === conv.id &&
          m.senderId !== userId &&
          m.createdAt > lastRead,
      ).length;

      let name = 'Hội thoại';
      let avatarUrl: string | null = null;
      let kind: 'field' | 'team' = 'team';

      if (conv.type === 'field' || conv.relatedFieldId) {
        kind = 'field';
        name = conv.relatedField?.name || 'Sân bóng';
      } else {
        const otherMember = allOtherMembers.find(
          (m) => m.conversationId === conv.id && m.userId !== userId,
        );
        if (otherMember) {
          const profile = profileMap.get(otherMember.userId);
          name =
            profile?.fullName ||
            otherMember.user?.email?.split('@')[0] ||
            'Đối thủ';
          avatarUrl = profile?.avatarUrl || null;
        }
      }

      result.push({
        id: conv.id,
        type: conv.type,
        name,
        avatarUrl,
        online: true,
        unreadCount,
        kind,
        relatedFieldId: conv.relatedFieldId,
        relatedPostId: conv.relatedPostId,
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              senderId: lastMsg.senderId,
              createdAt: lastMsg.createdAt,
            }
          : null,
        updatedAt: lastMsg ? lastMsg.createdAt : conv.updatedAt,
      });
    }

    // Sort by latest activity descending
    result.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return result;
  }

  async findDirectConversation(
    user1Id: string,
    user2Id: string,
  ): Promise<ConversationEntity | null> {
    const qb = this.repository
      .createQueryBuilder('c')
      .innerJoin(
        ConversationMemberEntity,
        'm1',
        'm1.conversation_id = c.id AND m1.user_id = :user1Id AND m1.deleted_at IS NULL',
        { user1Id },
      )
      .innerJoin(
        ConversationMemberEntity,
        'm2',
        'm2.conversation_id = c.id AND m2.user_id = :user2Id AND m2.deleted_at IS NULL',
        { user2Id },
      )
      .where('c.type = :type', { type: 'direct' });

    return qb.getOne();
  }

  async findConversationBetweenUsers(
    user1Id: string,
    user2Id: string,
  ): Promise<ConversationEntity | null> {
    const qb = this.repository
      .createQueryBuilder('c')
      .innerJoin(
        ConversationMemberEntity,
        'm1',
        'm1.conversation_id = c.id AND m1.user_id = :user1Id AND m1.deleted_at IS NULL',
        { user1Id },
      )
      .innerJoin(
        ConversationMemberEntity,
        'm2',
        'm2.conversation_id = c.id AND m2.user_id = :user2Id AND m2.deleted_at IS NULL',
        { user2Id },
      )
      .where('c.deleted_at IS NULL')
      .orderBy('c.created_at', 'DESC');

    return qb.getOne();
  }

  async findFieldConversation(
    userId: string,
    fieldId: string,
  ): Promise<ConversationEntity | null> {
    const qb = this.repository
      .createQueryBuilder('c')
      .innerJoin(
        ConversationMemberEntity,
        'm',
        'm.conversation_id = c.id AND m.user_id = :userId AND m.deleted_at IS NULL',
        { userId },
      )
      .where('c.related_field_id = :fieldId', { fieldId });

    return qb.getOne();
  }

  async findPostConversation(
    userId: string,
    postId: string,
  ): Promise<ConversationEntity | null> {
    const qb = this.repository
      .createQueryBuilder('c')
      .innerJoin(
        ConversationMemberEntity,
        'm',
        'm.conversation_id = c.id AND m.user_id = :userId AND m.deleted_at IS NULL',
        { userId },
      )
      .where('c.related_post_id = :postId', { postId });

    return qb.getOne();
  }

  async createWithMembers(data: {
    type: string;
    relatedFieldId?: string | null;
    relatedPostId?: string | null;
    memberUserIds: string[];
  }): Promise<ConversationEntity> {
    const convId = randomUUID();
    const conversation = this.repository.create({
      id: convId,
      type: data.type,
      relatedFieldId: data.relatedFieldId ?? null,
      relatedPostId: data.relatedPostId ?? null,
    });

    const saved = await this.repository.save(conversation);

    const members = data.memberUserIds.map((uId) =>
      this.memberRepository.create({
        conversationId: saved.id,
        userId: uId,
        joinedAt: new Date(),
        deletedAt: null,
        lastReadAt: new Date(),
      }),
    );

    await this.memberRepository.save(members);

    return saved;
  }
}
