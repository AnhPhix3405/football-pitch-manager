import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConversationMemberRepository } from '~/repositories/conversation-member.repository';
import { MessageRepository } from '~/repositories/message.repository';
import { EditMessageDto, SendMessageDto } from '../dto/chat-event.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationMemberRepository: ConversationMemberRepository,
  ) {}

  async saveMessage(userId: string, payload: SendMessageDto) {
    const message = await this.messageRepository.save(
      this.messageRepository.create({
        id: randomUUID(),
        conversationId: payload.conversationId,
        senderId: userId,
        content: payload.content || null,
        messageType: payload.messageType || 'text',
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

    const deletedAt = new Date();
    await this.messageRepository.updateMessage(messageId, {
      deletedAt,
    });

    return { ...message, deletedAt };
  }
}
