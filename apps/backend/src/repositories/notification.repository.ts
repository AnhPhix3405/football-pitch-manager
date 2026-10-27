import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { NotificationEntity } from '~/entities/notification.entity';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    repository: Repository<NotificationEntity>,
  ) {
    super(repository);
  }

  async findByUserId(
    userId: string,
    filter?: 'all' | 'unread',
    limit = 20,
  ): Promise<NotificationEntity[]> {
    const where: FindOptionsWhere<NotificationEntity> = {
      userId,
    };

    if (filter === 'unread') {
      where.isRead = false;
    }

    return this.repository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.repository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update({ userId, isRead: false }, { isRead: true });
  }
}
