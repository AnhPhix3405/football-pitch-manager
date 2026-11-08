import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EntityManager } from 'typeorm';
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

  private resolveLink(entity: NotificationEntity): string | undefined {
    switch (entity.type) {
      case 'match_request':
      case 'match_confirmed':
      case 'message':
        return '/messages';
      case 'booking_confirmed':
        return '/bookings';
      case 'owner_booking_created':
        return entity.refId
          ? `/owner/bookings/${entity.refId}`
          : '/owner/bookings';
      case 'owner_field_approved':
        return '/owner/fields';
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
      link: customLink || this.resolveLink(entity),
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

  async recordOwnerNotification(
    manager: EntityManager,
    params: {
      userId: string;
      type: 'owner_booking_created' | 'owner_field_approved';
      fieldName: string;
      refId: string;
    },
  ): Promise<NotificationResponseDto> {
    const entity = manager.create(NotificationEntity, {
      id: randomUUID(),
      userId: params.userId,
      type: params.type,
      title:
        params.type === 'owner_booking_created'
          ? 'Có đơn đặt sân mới'
          : 'Cụm sân đã được duyệt',
      content: params.fieldName,
      refId: params.refId,
      isRead: false,
    });
    return this.toDto(await manager.save(NotificationEntity, entity));
  }

  publish(userId: string, notification: NotificationResponseDto): void {
    this.chatGateway.emitToUsers([userId], 'notification:new', notification);
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

    this.publish(params.userId, dto);

    return dto;
  }
}
