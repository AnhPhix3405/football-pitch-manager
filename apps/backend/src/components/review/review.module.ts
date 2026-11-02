import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '~/components/auth/auth.module';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldRatingSummaryEntity } from '~/entities/field-rating-summary.entity';
import { FieldReviewEntity } from '~/entities/field-review.entity';
import { FieldEntity } from '~/entities/field.entity';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostEntity } from '~/entities/post.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserRatingSummaryEntity } from '~/entities/user-rating-summary.entity';
import { UserReviewEntity } from '~/entities/user-review.entity';
import { UserEntity } from '~/entities/user.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { FieldRankingController } from './controllers/field-ranking.controller';
import { FieldReviewController } from './controllers/field-review.controller';
import { UserReviewController } from './controllers/user-review.controller';
import { FieldRankingService } from './services/field-ranking.service';
import { FieldReviewService } from './services/field-review.service';
import { RatingSummaryService } from './services/rating-summary.service';
import { ReviewModerationService } from './services/review-moderation.service';
import { UserReviewService } from './services/user-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldReviewEntity,
      UserReviewEntity,
      FieldRatingSummaryEntity,
      UserRatingSummaryEntity,
      BookingEntity,
      FieldCourtEntity,
      FieldEntity,
      PostEntity,
      PostMatchEntity,
      UserProfileEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [
    FieldReviewController,
    UserReviewController,
    FieldRankingController,
  ],
  providers: [
    // Repositories
    FieldReviewRepository,
    UserReviewRepository,
    FieldRatingSummaryRepository,
    UserRatingSummaryRepository,
    BookingRepository,
    PostRepository,
    PostMatchRepository,

    // Services
    RatingSummaryService,
    FieldReviewService,
    UserReviewService,
    ReviewModerationService,
    FieldRankingService,
  ],
  exports: [
    RatingSummaryService,
    FieldReviewService,
    UserReviewService,
    ReviewModerationService,
    FieldRankingService,
  ],
})
export class ReviewModule {}
