import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TokenService } from '~/components/auth/services/token.service';
import {
  DeleteMessageDto,
  EditMessageDto,
  MarkAsDeliveredDto,
  MarkAsReadDto,
  SendMessageDto,
} from '../dto/chat-event.dto';
import { ChatService } from '../services/chat.service';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
@UsePipes(new ValidationPipe({ transform: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly tokenService: TokenService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const headers = client.handshake.headers as
        Record<string, unknown> | undefined;
      const authHeader = headers?.authorization;
      const bearerToken =
        typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;
      const auth = client.handshake.auth as Record<string, unknown> | undefined;
      const rawToken = auth?.token;
      const token = typeof rawToken === 'string' ? rawToken : bearerToken;

      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = await this.tokenService.verifyAccessToken(token);
      (client.data as { userId?: string }).userId = decoded.sub;
      await client.join(`user:${decoded.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect() {
    // Optionally handle disconnect logic here
  }

  emitToUsers(userIds: string[], event: string, payload: unknown) {
    if (!this.server) return;
    for (const userId of userIds) {
      this.server.to(`user:${userId}`).emit(event, payload);
    }
  }

  emitToConversation(conversationId: string, event: string, payload: unknown) {
    if (!this.server) return;
    this.server.to(conversationId).emit(event, payload);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data.conversationId) {
      await client.join(data.conversationId);
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data.conversationId) {
      await client.leave(data.conversationId);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const userId = client.data.userId;
    const message = await this.chatService.saveMessage(userId, payload);
    this.server.to(payload.conversationId).emit('receive_message', message);
    const memberUserIds = await this.chatService.getConversationMemberUserIds(
      payload.conversationId,
    );
    this.emitToUsers(memberUserIds, 'receive_message', message);
  }

  @SubscribeMessage('mark_as_delivered')
  async handleMarkAsDelivered(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MarkAsDeliveredDto,
  ) {
    const userId = client.data.userId;
    await this.chatService.updateDeliveredAt(payload.conversationId, userId);
    this.server.to(payload.conversationId).emit('message_delivered', {
      userId,
      conversationId: payload.conversationId,
    });
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MarkAsReadDto,
  ) {
    const userId = client.data.userId;
    await this.chatService.updateReadAt(payload.conversationId, userId);
    this.server.to(payload.conversationId).emit('message_read', {
      userId,
      conversationId: payload.conversationId,
    });
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: EditMessageDto,
  ) {
    const userId = client.data.userId;
    const edited = await this.chatService.editMessage(userId, payload);
    this.server.to(edited.conversationId).emit('message_edited', edited);
    const memberUserIds = await this.chatService.getConversationMemberUserIds(
      edited.conversationId,
    );
    this.emitToUsers(memberUserIds, 'message_edited', edited);
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: DeleteMessageDto,
  ) {
    const userId = client.data.userId;
    const deleted = await this.chatService.deleteMessage(
      userId,
      payload.messageId,
    );
    const deletePayload = {
      messageId: payload.messageId,
      conversationId: deleted.conversationId,
    };
    this.server
      .to(deleted.conversationId)
      .emit('message_deleted', deletePayload);
    const memberUserIds = await this.chatService.getConversationMemberUserIds(
      deleted.conversationId,
    );
    this.emitToUsers(memberUserIds, 'message_deleted', deletePayload);
  }
}
