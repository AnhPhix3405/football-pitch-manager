import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '~/components/auth/auth.module';
import { ConversationMemberEntity } from '~/entities/conversation-member.entity';
import { ConversationEntity } from '~/entities/conversation.entity';
import { FieldEntity } from '~/entities/field.entity';
import { MessageEntity } from '~/entities/message.entity';
import { PostEntity } from '~/entities/post.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { ConversationMemberRepository } from '~/repositories/conversation-member.repository';
import { ConversationRepository } from '~/repositories/conversation.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { MessageRepository } from '~/repositories/message.repository';
import { PostRepository } from '~/repositories/post.repository';
import { ChatController } from './controllers/chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      ConversationMemberEntity,
      MessageEntity,
      UserProfileEntity,
      FieldEntity,
      PostEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    MessageRepository,
    ConversationMemberRepository,
    ConversationRepository,
    FieldRepository,
    PostRepository,
  ],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
