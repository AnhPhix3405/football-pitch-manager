import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '~/components/auth/auth.module';
import { ChatModule } from '~/components/chat/chat.module';
import { NotificationModule } from '~/components/notification/notification.module';
import { PostCommentEntity } from '~/entities/post-comment.entity';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostEntity } from '~/entities/post.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { PostCommentRepository } from '~/repositories/post-comment.repository';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { PostCommentController } from './controllers/post-comment.controller';
import { PostMatchController } from './controllers/post-match.controller';
import { PostController } from './controllers/post.controller';
import { PostCleanupService } from './services/post-cleanup.service';
import { PostCommentService } from './services/post-comment.service';
import { PostMatchService } from './services/post-match.service';
import { PostService } from './services/post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      PostMatchEntity,
      PostCommentEntity,
      UserProfileEntity,
    ]),
    AuthModule,
    ChatModule,
    NotificationModule,
  ],
  controllers: [PostController, PostMatchController, PostCommentController],
  providers: [
    PostService,
    PostMatchService,
    PostCommentService,
    PostCleanupService,
    PostRepository,
    PostMatchRepository,
    PostCommentRepository,
  ],
  exports: [
    PostService,
    PostMatchService,
    PostCommentService,
    PostCleanupService,
  ],
})
export class PostModule {}
