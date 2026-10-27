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
}
