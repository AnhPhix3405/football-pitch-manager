import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ChatGateway } from '~/components/chat/gateways/chat.gateway';
import { NotificationEntity } from '~/entities/notification.entity';
import { NotificationRepository } from '~/repositories/notification.repository';
import { NotificationResponseDto } from '../dto/notification-response.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly chatGateway: ChatGateway,
  ) {}

  private resolveLink(type: string): string | undefined {
    switch (type) {
      case 'match_request':
      case 'match_confirmed':
      case 'message':
        return '/messages';
      case 'booking_confirmed':
        return '/bookings';
      default:
        return undefined;
    }
  }

  private toDto(
    entity: NotificationEntity,
    customLink?: string,
  ): NotificationResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title,
      content: entity.content,
      refId: entity.refId,
      isRead: entity.isRead,
      createdAt: entity.createdAt,
      link: customLink || this.resolveLink(entity.type),
    };
  }

  async getUserNotifications(
    userId: string,
    filter?: 'all' | 'unread',
    limit = 20,
  ): Promise<NotificationResponseDto[]> {
    const list = await this.notificationRepository.findByUserId(
      userId,
      filter,
      limit,
    );
    return list.map((item) => this.toDto(item));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnreadByUserId(userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.notificationRepository.markAsRead(userId, notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async createAndSend(params: {
    userId: string;
    type: string;
    title: string;
    content?: string | null;
    refId?: string | null;
    link?: string;
  }): Promise<NotificationResponseDto> {
    const notification = this.notificationRepository.create({
      id: randomUUID(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      content: params.content ?? null,
      refId: params.refId ?? null,
      isRead: false,
    });

    const saved = await this.notificationRepository.save(notification);
    const dto = this.toDto(saved, params.link);

    // Phát sự kiện realtime qua WebSocket đến room của user
    this.chatGateway.emitToUsers([params.userId], 'notification:new', dto);

    return dto;
  }
}
