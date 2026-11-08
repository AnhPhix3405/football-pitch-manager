import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FieldReviewEntity } from '~/entities/field-review.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { CreateFieldReviewDto } from '../dto/create-field-review.dto';
import { QueryReviewDto } from '../dto/query-review.dto';
import { RatingSummaryService } from './rating-summary.service';

@Injectable()
export class FieldReviewService {
  constructor(
    private readonly fieldReviewRepository: FieldReviewRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly ratingSummaryService: RatingSummaryService,
  ) {}

  async createReview(
    reviewerId: string,
    dto: CreateFieldReviewDto,
  ): Promise<FieldReviewEntity> {
    const booking = await this.bookingRepository.findById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException('bookingNotFound');
    }

    if (booking.userId !== reviewerId) {
      throw new ForbiddenException('forbiddenFieldAccess');
    }

    if (booking.status !== 'completed') {
      throw new BadRequestException('bookingNotCompleted');
    }

    const existingReview =
      await this.fieldReviewRepository.findByBookingAndReviewer(
        dto.bookingId,
        reviewerId,
      );
    if (existingReview) {
      throw new ConflictException('duplicateReview');
    }

    const review = this.fieldReviewRepository.create({
      id: randomUUID(),
      fieldId: booking.fieldId,
      reviewerId,
      bookingId: dto.bookingId,
      rating: dto.rating,
      comment: dto.comment ?? null,
      isFlagged: false,
      flagReason: null,
    });

    const saved = await this.fieldReviewRepository.save(review);

    await this.ratingSummaryService.recalculateFieldSummary(booking.fieldId);

    return saved;
  }

  async getReviewsByField(
    fieldId: string,
    query: QueryReviewDto,
  ): Promise<{
    data: FieldReviewEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));

    const { items, total } = await this.fieldReviewRepository.findByFieldId(
      fieldId,
      {
        page,
        limit,
        rating: query.rating,
      },
    );

    return {
      data: items,
      total,
      page,
      limit,
    };
  }

  async getReviewById(id: string): Promise<FieldReviewEntity> {
    const review = await this.fieldReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('reviewNotFound');
    }
    return review;
  }
}
