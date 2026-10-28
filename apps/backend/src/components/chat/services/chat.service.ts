import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { STORAGE_SERVICE_TOKEN } from '~/common/storage/constants/storage.constant';
import type { IStorageService } from '~/common/storage/interfaces/storage-service.interface';
import { ConversationMemberRepository } from '~/repositories/conversation-member.repository';
import { ConversationRepository } from '~/repositories/conversation.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { MessageRepository } from '~/repositories/message.repository';
import { PostRepository } from '~/repositories/post.repository';
import { CONVERSATION_TYPE, MESSAGE_TYPE } from '../constants/chat.constant';
import { EditMessageDto, SendMessageDto } from '../dto/chat-event.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationMemberRepository: ConversationMemberRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly fieldRepository: FieldRepository,
    private readonly postRepository: PostRepository,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async getUserConversations(userId: string) {
    return this.conversationRepository.getUserConversations(userId);
  }

  async getConversationMessages(
    userId: string,
    conversationId: string,
    limit = 20,
    before?: string,
  ) {
    const isMember = await this.conversationRepository.isMember(
      conversationId,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'Bạn không có quyền xem cuộc trò chuyện này',
      );
    }

    const messages = await this.messageRepository.findByConversationId(
      conversationId,
      limit,
      before,
    );

    // Cập nhật đã đọc tin nhắn
    await this.conversationMemberRepository.updateLastReadAt(
      conversationId,
      userId,
    );

    return messages.map((m) => {
      if (m.deletedAt) {
        return { ...m, content: null };
      }
      return m;
    });
  }

  async createOrGetConversation(userId: string, dto: CreateConversationDto) {
    if (dto.relatedFieldId) {
      const field = await this.fieldRepository.findById(dto.relatedFieldId);
      if (!field) {
        throw new NotFoundException('Không tìm thấy thông tin sân bóng');
      }

      let conv = await this.conversationRepository.findFieldConversation(
        userId,
        field.id,
      );
      if (!conv) {
        conv = await this.conversationRepository.createWithMembers({
          type: CONVERSATION_TYPE.FIELD,
          relatedFieldId: field.id,
          memberUserIds: Array.from(new Set([userId, field.ownerId])),
        });
      }
      return conv;
    }

    if (dto.relatedPostId) {
      const post = await this.postRepository.findById(dto.relatedPostId);
      if (!post) {
        throw new NotFoundException('Không tìm thấy thông tin bài đăng');
      }

      let conv = await this.conversationRepository.findPostConversation(
        userId,
        post.id,
      );
      if (!conv) {
        conv = await this.conversationRepository.createWithMembers({
          type: CONVERSATION_TYPE.POST,
          relatedPostId: post.id,
          memberUserIds: Array.from(new Set([userId, post.userId])),
        });
      }
      return conv;
    }

    if (dto.targetUserId) {
      if (dto.targetUserId === userId) {
        throw new BadRequestException(
          'Không thể tự tạo hội thoại với chính mình',
        );
      }

      let conv = await this.conversationRepository.findDirectConversation(
        userId,
        dto.targetUserId,
      );
      if (!conv) {
        conv = await this.conversationRepository.createWithMembers({
          type: CONVERSATION_TYPE.DIRECT,
          memberUserIds: [userId, dto.targetUserId],
        });
      }
      return conv;
    }

    throw new BadRequestException(
      'Cần cung cấp targetUserId, relatedFieldId hoặc relatedPostId',
    );
  }

  async createMatchConversation(
    postId: string,
    hostUserId: string,
    applicantId: string,
    postTitle: string,
  ) {
    // 1. Kiểm tra xem đã tồn tại cuộc trò chuyện giữa 2 người dùng chưa
    let conv = await this.conversationRepository.findConversationBetweenUsers(
      hostUserId,
      applicantId,
    );

    // 2. Nếu chưa có, tạo cuộc trò chuyện mới
    if (!conv) {
      conv = await this.conversationRepository.createWithMembers({
        type: CONVERSATION_TYPE.POST,
        relatedPostId: postId,
        memberUserIds: Array.from(new Set([hostUserId, applicantId])),
      });
    }

    const message = await this.saveMessage(hostUserId, {
      conversationId: conv.id,
      content: `Chào bạn! Đội mình đã đồng ý ghép trận cho bài đăng "${postTitle}". Hãy trao đổi chi tiết tại đây nhé!`,
      messageType: MESSAGE_TYPE.TEXT,
    });

    return { conversation: conv, message };
  }

  async saveMessage(userId: string, payload: SendMessageDto) {
    const message = await this.messageRepository.save(
      this.messageRepository.create({
        id: randomUUID(),
        conversationId: payload.conversationId,
        senderId: userId,
        content: payload.content || null,
        messageType: payload.messageType || MESSAGE_TYPE.TEXT,
        isEdited: false,
      }),
    );
    return message;
  }

  async updateDeliveredAt(conversationId: string, userId: string) {
    await this.conversationMemberRepository.updateLastDeliveredAt(
      conversationId,
      userId,
    );
  }

  async updateReadAt(conversationId: string, userId: string) {
    await this.conversationMemberRepository.updateLastReadAt(
      conversationId,
      userId,
    );
  }

  async editMessage(userId: string, payload: EditMessageDto) {
    const message = await this.messageRepository.findById(payload.messageId);
    if (!message || message.senderId !== userId) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    await this.messageRepository.updateMessage(payload.messageId, {
      content: payload.content,
      isEdited: true,
    });

    return { ...message, content: payload.content, isEdited: true };
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageRepository.findById(messageId);
    if (!message || message.senderId !== userId) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    if (message.messageType === MESSAGE_TYPE.IMAGE && message.content) {
      try {
        const storagePath = this.extractStoragePath(message.content);
        if (storagePath) {
          await this.storageService.deleteFile(storagePath);
        }
      } catch (err: unknown) {
        // Log error but proceed with message soft deletion
        console.error('Failed to delete image from Supabase storage:', err);
      }
    }

    const deletedAt = new Date();
    await this.messageRepository.updateMessage(messageId, {
      deletedAt,
      content: null,
    });

    return { ...message, content: null, deletedAt };
  }

  private extractStoragePath(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const chatIndex = urlObj.pathname.indexOf('chat/');
      if (chatIndex !== -1) {
        return urlObj.pathname.substring(chatIndex);
      }
      return null;
    } catch {
      const chatIndex = url.indexOf('chat/');
      if (chatIndex !== -1) {
        return url.substring(chatIndex).split('?')[0];
      }
      return null;
    }
  }
}
