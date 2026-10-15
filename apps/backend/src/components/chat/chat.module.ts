import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '~/components/auth/auth.module';
import { ConversationMemberEntity } from '~/entities/conversation-member.entity';
import { MessageEntity } from '~/entities/message.entity';
import { ConversationMemberRepository } from '~/repositories/conversation-member.repository';
import { MessageRepository } from '~/repositories/message.repository';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, ConversationMemberEntity]),
    AuthModule,
  ],
  providers: [
    ChatGateway,
    ChatService,
    MessageRepository,
    ConversationMemberRepository,
  ],
})
export class ChatModule {}
