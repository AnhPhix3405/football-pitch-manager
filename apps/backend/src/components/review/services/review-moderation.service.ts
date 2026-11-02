import { Injectable, NotFoundException } from '@nestjs/common';
import { FieldReviewEntity } from '~/entities/field-review.entity';
import { UserReviewEntity } from '~/entities/user-review.entity';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import {
  MODERATION_ACTION,
  ModerationAction,
} from '../constants/review.constant';
import { RatingSummaryService } from './rating-summary.service';

@Injectable()
export class ReviewModerationService {
  constructor(
    private readonly fieldReviewRepository: FieldReviewRepository,
    private readonly userReviewRepository: UserReviewRepository,
    private readonly ratingSummaryService: RatingSummaryService,
  ) {}

  async reportFieldReview(
    id: string,
    reason: string,
  ): Promise<FieldReviewEntity> {
    const review = await this.fieldReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('reviewNotFound');
    }

    review.isFlagged = true;
    review.flagReason = reason;

    return await this.fieldReviewRepository.save(review);
  }

  async reportUserReview(
    id: string,
    reason: string,
  ): Promise<UserReviewEntity> {
    const review = await this.userReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('reviewNotFound');
    }

    review.isFlagged = true;
    review.flagReason = reason;

    return await this.userReviewRepository.save(review);
  }

  async moderateFieldReview(
    id: string,
    action: ModerationAction,
    reason?: string,
  ): Promise<FieldReviewEntity> {
    const review = await this.fieldReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('reviewNotFound');
    }

    if (action === MODERATION_ACTION.DISMISS) {
      review.isFlagged = false;
      review.flagReason = null;
    } else if (action === MODERATION_ACTION.HIDE) {
      review.isFlagged = true;
      review.flagReason = reason ? `HIDDEN: ${reason}` : 'HIDDEN';
    }

    const saved = await this.fieldReviewRepository.save(review);

    if (action === MODERATION_ACTION.HIDE) {
      await this.ratingSummaryService.recalculateFieldSummary(review.fieldId);
    }

    return saved;
  }

  async moderateUserReview(
    id: string,
    action: ModerationAction,
    reason?: string,
  ): Promise<UserReviewEntity> {
    const review = await this.userReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('reviewNotFound');
    }

    if (action === MODERATION_ACTION.DISMISS) {
      review.isFlagged = false;
      review.flagReason = null;
    } else if (action === MODERATION_ACTION.HIDE) {
      review.isFlagged = true;
      review.flagReason = reason ? `HIDDEN: ${reason}` : 'HIDDEN';
    }

    const saved = await this.userReviewRepository.save(review);

    if (action === MODERATION_ACTION.HIDE) {
      await this.ratingSummaryService.recalculateUserSummary(
        review.targetUserId,
      );
    }

    return saved;
  }
}
