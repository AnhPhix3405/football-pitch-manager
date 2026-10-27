import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
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
  ): Promise<MessageEntity[]> {
    const where: FindOptionsWhere<MessageEntity> = {
      conversationId,
    };

    if (before) {
      where.createdAt = LessThan(new Date(before));
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
}
