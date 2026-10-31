import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationMemberEntity } from '~/entities/conversation-member.entity';

@Injectable()
export class ConversationMemberRepository {
  constructor(
    @InjectRepository(ConversationMemberEntity)
    private readonly repository: Repository<ConversationMemberEntity>,
  ) {}

  updateLastDeliveredAt(conversationId: string, userId: string): Promise<void> {
    void conversationId;
    void userId;
    return Promise.resolve();
  }

  async updateLastReadAt(conversationId: string, userId: string) {
    await this.repository.update(
      { conversationId, userId },
      {
        lastReadAt: new Date(),
      },
    );
  }

  async getMember(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMemberEntity | null> {
    return this.repository.findOne({
      where: { conversationId, userId },
    });
  }

  async softDeleteMember(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const now = new Date();
    await this.repository.update(
      { conversationId, userId },
      {
        deletedAt: now,
        chatClearedAt: now,
      },
    );
  }

  async restoreMember(conversationId: string, userId: string): Promise<void> {
    await this.repository.update(
      { conversationId, userId },
      {
        deletedAt: null,
      },
    );
  }

  async restoreDeletedMembers(conversationId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(ConversationMemberEntity)
      .set({ deletedAt: null })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('deleted_at IS NOT NULL')
      .execute();
  }

  async findMembers(
    conversationId: string,
  ): Promise<ConversationMemberEntity[]> {
    return this.repository.find({
      where: { conversationId },
    });
  }

  async areAllMembersDeleted(conversationId: string): Promise<boolean> {
    const members = await this.findMembers(conversationId);
    if (members.length === 0) return true;
    return members.every((m) => m.deletedAt !== null);
  }

  async deleteByConversationId(conversationId: string): Promise<void> {
    await this.repository.delete({ conversationId });
  }
}
