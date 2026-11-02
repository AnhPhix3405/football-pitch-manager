import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldReviewEntity } from '~/entities/field-review.entity';

export interface FindFieldReviewsOptions {
  page?: number;
  limit?: number;
  rating?: number;
}

@Injectable()
export class FieldReviewRepository extends BaseRepository<FieldReviewEntity> {
  constructor(
    @InjectRepository(FieldReviewEntity)
    repository: Repository<FieldReviewEntity>,
  ) {
    super(repository);
  }

  async findByBookingAndReviewer(
    bookingId: string,
    reviewerId: string,
  ): Promise<FieldReviewEntity | null> {
    return this.repository.findOne({
      where: { bookingId, reviewerId },
      relations: { reviewer: true, booking: true },
    });
  }

  async findByFieldId(
    fieldId: string,
    options: FindFieldReviewsOptions = {},
  ): Promise<{ items: FieldReviewEntity[]; total: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.fieldId = :fieldId', { fieldId })
      .andWhere('review.isFlagged = false');

    if (options.rating) {
      qb.andWhere('review.rating = :rating', { rating: options.rating });
    }

    qb.orderBy('review.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findFlaggedReviews(
    options: { page?: number; limit?: number } = {},
  ): Promise<{ items: FieldReviewEntity[]; total: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await this.repository.findAndCount({
      where: { isFlagged: true },
      relations: { reviewer: true, field: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  async calculateSummary(fieldId: string): Promise<{
    avgRating: number;
    totalReviews: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .where('review.fieldId = :fieldId', { fieldId })
      .andWhere('review.isFlagged = false')
      .getRawOne<{ avgRating: string | null; totalReviews: string }>();

    return {
      avgRating: Number(result?.avgRating || 0),
      totalReviews: Number(result?.totalReviews || 0),
    };
  }
}
