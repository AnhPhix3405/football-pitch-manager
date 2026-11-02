import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldImageEntity } from '~/entities/field-image.entity';
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
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import { FieldReviewController } from './controllers/field-review.controller';
import { RankingController } from './controllers/ranking.controller';
import { UserReviewController } from './controllers/user-review.controller';
import { FieldReviewService } from './services/field-review.service';
import { RankingService } from './services/ranking.service';
import { UserReviewService } from './services/user-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldReviewEntity,
      UserReviewEntity,
      FieldRatingSummaryEntity,
      UserRatingSummaryEntity,
      BookingEntity,
      FieldEntity,
      FieldImageEntity,
      UserEntity,
      UserProfileEntity,
      PostEntity,
      PostMatchEntity,
    ]),
    AuthModule,
  ],
  controllers: [FieldReviewController, UserReviewController, RankingController],
  providers: [
    FieldReviewRepository,
    UserReviewRepository,
    FieldRatingSummaryRepository,
    UserRatingSummaryRepository,
    BookingRepository,
    FieldRepository,
    FieldImageRepository,
    UserRepository,
    PostRepository,
    PostMatchRepository,
    FieldReviewService,
    UserReviewService,
    RankingService,
  ],
  exports: [
    FieldReviewService,
    UserReviewService,
    RankingService,
    FieldReviewRepository,
    UserReviewRepository,
    FieldRatingSummaryRepository,
    UserRatingSummaryRepository,
  ],
})
export class ReviewModule {}
