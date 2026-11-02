import { Injectable, Logger } from '@nestjs/common';
import { FieldRatingSummaryEntity } from '~/entities/field-rating-summary.entity';
import { UserRatingSummaryEntity } from '~/entities/user-rating-summary.entity';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { DEFAULT_BAYESIAN_PARAMS } from '../constants/review.constant';
import { RatingSummaryCalculated } from '../interfaces/review.interface';

@Injectable()
export class RatingSummaryService {
  private readonly logger = new Logger(RatingSummaryService.name);

  constructor(
    private readonly fieldReviewRepository: FieldReviewRepository,
    private readonly userReviewRepository: UserReviewRepository,
    private readonly fieldRatingSummaryRepository: FieldRatingSummaryRepository,
    private readonly userRatingSummaryRepository: UserRatingSummaryRepository,
  ) {}

  public calculateBayesianScore(
    totalReviews: number,
    avgRating: number,
    c = DEFAULT_BAYESIAN_PARAMS.C,
    m = DEFAULT_BAYESIAN_PARAMS.M,
  ): number {
    if (totalReviews <= 0) {
      return 0;
    }
    return (c * m + totalReviews * avgRating) / (c + totalReviews);
  }

  async recalculateFieldSummary(
    fieldId: string,
    maxRetries = 3,
  ): Promise<FieldRatingSummaryEntity> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const stats =
          await this.fieldReviewRepository.calculateSummary(fieldId);
        const totalReviews = stats.totalReviews;
        const avgRatingNum = stats.avgRating;
        const bayesianNum = this.calculateBayesianScore(
          totalReviews,
          avgRatingNum,
        );

        let summary =
          await this.fieldRatingSummaryRepository.findByFieldId(fieldId);

        if (!summary) {
          summary = this.fieldRatingSummaryRepository.create({
            fieldId,
            avgRating: avgRatingNum.toFixed(2),
            totalReviews,
            bayesianScore: bayesianNum.toFixed(3),
          });
        } else {
          summary.avgRating = avgRatingNum.toFixed(2);
          summary.totalReviews = totalReviews;
          summary.bayesianScore = bayesianNum.toFixed(3);
        }

        return await this.fieldRatingSummaryRepository.save(summary);
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(
            `Failed to recalculate field summary for ${fieldId} after ${maxRetries} attempts`,
            error,
          );
          throw error;
        }
      }
    }

    throw new Error(`Failed to recalculate field summary for ${fieldId}`);
  }

  async recalculateUserSummary(
    userId: string,
    maxRetries = 3,
  ): Promise<UserRatingSummaryEntity> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const stats = await this.userReviewRepository.calculateSummary(userId);
        const totalReviews = stats.totalReviews;
        const avgRatingNum = stats.avgRating;
        const scoreNum = this.calculateBayesianScore(
          totalReviews,
          avgRatingNum,
        );

        let summary =
          await this.userRatingSummaryRepository.findByUserId(userId);

        if (!summary) {
          summary = this.userRatingSummaryRepository.create({
            userId,
            avgRating: avgRatingNum.toFixed(2),
            totalReviews,
            sportsmanshipScore: scoreNum.toFixed(2),
          });
        } else {
          summary.avgRating = avgRatingNum.toFixed(2);
          summary.totalReviews = totalReviews;
          summary.sportsmanshipScore = scoreNum.toFixed(2);
        }

        return await this.userRatingSummaryRepository.save(summary);
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.error(
            `Failed to recalculate user summary for ${userId} after ${maxRetries} attempts`,
            error,
          );
          throw error;
        }
      }
    }

    throw new Error(`Failed to recalculate user summary for ${userId}`);
  }

  async getFieldSummary(fieldId: string): Promise<RatingSummaryCalculated> {
    const summary =
      await this.fieldRatingSummaryRepository.findByFieldId(fieldId);
    if (!summary) {
      return {
        avgRating: '0.00',
        totalReviews: 0,
        bayesianScore: '0.000',
      };
    }
    return {
      avgRating: summary.avgRating,
      totalReviews: summary.totalReviews,
      bayesianScore: summary.bayesianScore,
    };
  }

  async getUserSummary(userId: string): Promise<RatingSummaryCalculated> {
    const summary = await this.userRatingSummaryRepository.findByUserId(userId);
    if (!summary) {
      return {
        avgRating: '0.00',
        totalReviews: 0,
        sportsmanshipScore: '0.00',
      };
    }
    return {
      avgRating: summary.avgRating,
      totalReviews: summary.totalReviews,
      sportsmanshipScore: summary.sportsmanshipScore,
    };
  }
}
