import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
