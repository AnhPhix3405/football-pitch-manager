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
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = await this.tokenService.verifyAccessToken(token);
      client.data.userId = decoded.sub;
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Optionally handle disconnect logic here
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data.conversationId) {
      client.join(data.conversationId);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const userId = client.data.userId;
    const message = await this.chatService.saveMessage(userId, payload);
    this.server.to(payload.conversationId).emit('receive_message', message);
  }

  @SubscribeMessage('mark_as_delivered')
  async handleMarkAsDelivered(
    @ConnectedSocket() client: Socket,
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
    @ConnectedSocket() client: Socket,
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
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: EditMessageDto,
  ) {
    const userId = client.data.userId;
    const edited = await this.chatService.editMessage(userId, payload);
    this.server.to(edited.conversationId).emit('message_edited', edited);
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DeleteMessageDto,
  ) {
    const userId = client.data.userId;
    const deleted = await this.chatService.deleteMessage(
      userId,
      payload.messageId,
    );
    this.server.to(deleted.conversationId).emit('message_deleted', {
      messageId: payload.messageId,
      conversationId: deleted.conversationId,
    });
  }
}
