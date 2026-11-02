import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { UserReviewEntity } from '~/entities/user-review.entity';

export interface FindUserReviewsOptions {
  page?: number;
  limit?: number;
  rating?: number;
}

@Injectable()
export class UserReviewRepository extends BaseRepository<UserReviewEntity> {
  constructor(
    @InjectRepository(UserReviewEntity)
    repository: Repository<UserReviewEntity>,
  ) {
    super(repository);
  }

  async findByPostTargetAndReviewer(
    postId: string,
    targetUserId: string,
    reviewerId: string,
  ): Promise<UserReviewEntity | null> {
    return this.repository.findOne({
      where: { postId, targetUserId, reviewerId },
      relations: { reviewer: true, targetUser: true, post: true },
    });
  }

  async findByTargetUserId(
    targetUserId: string,
    options: FindUserReviewsOptions = {},
  ): Promise<{ items: UserReviewEntity[]; total: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const whereCondition: {
      targetUserId: string;
      isFlagged: boolean;
      rating?: number;
    } = { targetUserId, isFlagged: false };

    if (options.rating) {
      whereCondition.rating = options.rating;
    }

    const [items, total] = await this.repository.findAndCount({
      where: whereCondition,
      relations: { reviewer: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  async findFlaggedReviews(
    options: FindUserReviewsOptions = {},
  ): Promise<{ items: UserReviewEntity[]; total: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await this.repository.findAndCount({
      where: { isFlagged: true },
      relations: { reviewer: true, targetUser: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  async calculateSummary(targetUserId: string): Promise<{
    avgRating: number;
    totalReviews: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .where('review.targetUserId = :targetUserId', { targetUserId })
      .andWhere('review.isFlagged = false')
      .getRawOne<{ avgRating: string | null; totalReviews: string }>();

    return {
      avgRating: Number(result?.avgRating || 0),
      totalReviews: Number(result?.totalReviews || 0),
    };
  }
}
