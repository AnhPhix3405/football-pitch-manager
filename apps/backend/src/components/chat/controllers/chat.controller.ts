import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '~/components/auth/decorators/current-user.decorator';
import { AccountStatusGuard } from '~/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '~/components/auth/guards/jwt-auth.guard';
import {
  ApiChatControllerDoc,
  ApiCreateConversationDoc,
  ApiGetConversationsDoc,
  ApiGetMessagesDoc,
} from '../docs/chat.doc';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { ChatService } from '../services/chat.service';

@ApiChatControllerDoc()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('conversations')
  @HttpCode(HttpStatus.OK)
  @ApiGetConversationsDoc()
  async getMyConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getUserConversations(userId);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Post('conversations')
  @HttpCode(HttpStatus.OK)
  @ApiCreateConversationDoc()
  async createOrGetConversation(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createOrGetConversation(userId, dto);
  }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @Get('conversations/:id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiGetMessagesDoc()
  async getConversationMessages(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    const parsedLimit = limit ? Math.min(Math.max(Number(limit), 1), 100) : 20;
    return this.chatService.getConversationMessages(
      userId,
      conversationId,
      parsedLimit,
      before,
    );
  }
}
