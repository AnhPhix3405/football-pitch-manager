import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { ConversationMemberEntity } from '~/entities/conversation-member.entity';

@Injectable()
export class ConversationMemberRepository {
  constructor(
    @InjectRepository(ConversationMemberEntity)
    private readonly repository: Repository<ConversationMemberEntity>,
  ) {}

  async updateLastDeliveredAt(conversationId: string, userId: string) {
    await this.repository.update(
      { conversationId, userId },
      {
        lastDeliveredAt: new Date(),
      },
    );
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
