import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '~/components/auth/auth.module';
import { AiUsageLogEntity } from '~/entities/ai-usage-log.entity';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostEntity } from '~/entities/post.entity';
import { SubscriptionPlanEntity } from '~/entities/subscription-plan.entity';
import { SubscriptionEntity } from '~/entities/subscription.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserRatingSummaryEntity } from '~/entities/user-rating-summary.entity';
import { UserEntity } from '~/entities/user.entity';
import { AiUsageLogRepository } from '~/repositories/ai-usage-log.repository';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { AiController } from './controllers/ai.controller';
import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';
import { AiFoundationService } from './services/ai-foundation.service';
import { AiUsageService } from './services/ai-usage.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      AiUsageLogEntity,
      SubscriptionEntity,
      SubscriptionPlanEntity,
      PostEntity,
      PostMatchEntity,
      UserProfileEntity,
      UserRatingSummaryEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [AiController],
  providers: [
    AiUsageLogRepository,
    SubscriptionRepository,
    PostRepository,
    PostMatchRepository,
    UserRatingSummaryRepository,
    AiUsageService,
    AiFoundationService,
    AiRateLimitGuard,
  ],
  exports: [AiUsageService, AiFoundationService],
})
export class AiModule {}
