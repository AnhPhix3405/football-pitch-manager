import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { MessageEntity } from '~/entities/message.entity';

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity> {
  constructor(
    @InjectRepository(MessageEntity) repository: Repository<MessageEntity>,
  ) {
    super(repository);
  }

  async updateMessage(id: string, partial: Partial<MessageEntity>) {
    await this.repository.update(id, partial);
  }

  async findByConversationId(
    conversationId: string,
    limit = 20,
    before?: string,
    afterDate?: Date,
  ): Promise<MessageEntity[]> {
    const where: FindOptionsWhere<MessageEntity> = {
      conversationId,
    };

    if (before && afterDate) {
      where.createdAt = And(MoreThan(afterDate), LessThan(new Date(before)));
    } else if (before) {
      where.createdAt = LessThan(new Date(before));
    } else if (afterDate) {
      where.createdAt = MoreThan(afterDate);
    }

    const messages = await this.repository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });

    return messages.reverse();
  }

  async findImagesByConversationId(
    conversationId: string,
  ): Promise<MessageEntity[]> {
    return this.repository.find({
      where: {
        conversationId,
        messageType: 'image',
      },
    });
  }

  async deleteByConversationId(conversationId: string): Promise<void> {
    await this.repository.delete({ conversationId });
  }
}
