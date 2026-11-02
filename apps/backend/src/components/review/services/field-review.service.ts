import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { CreateFieldReviewDto } from '../dto/create-field-review.dto';

@Injectable()
export class FieldReviewService {
  constructor(
    private readonly fieldReviewRepository: FieldReviewRepository,
    private readonly fieldRatingSummaryRepository: FieldRatingSummaryRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly fieldRepository: FieldRepository,
  ) {}

  async createReview(
    userId: string,
    fieldId: string,
    dto: CreateFieldReviewDto,
  ) {
    const field = await this.fieldRepository.findById(fieldId);
    if (!field) {
      throw new NotFoundException('Sân bóng không tồn tại');
    }

    const booking = await this.bookingRepository.findById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException('Đơn đặt sân không tồn tại');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException(
        'Bạn chỉ có thể đánh giá cho đơn đặt sân của chính mình',
      );
    }

    if (booking.fieldId !== fieldId) {
      throw new BadRequestException('Đơn đặt sân không thuộc về sân bóng này');
    }

    if (booking.status !== 'completed') {
      throw new BadRequestException(
        'Chỉ có thể đánh giá sau khi trận đấu tại sân đã hoàn tất (trạng thái completed)',
      );
    }

    const existingReview =
      await this.fieldReviewRepository.findByBookingAndReviewer(
        dto.bookingId,
        userId,
      );
    if (existingReview) {
      throw new ConflictException(
        'Bạn đã gửi đánh giá cho đơn đặt sân này rồi',
      );
    }

    const newReview = this.fieldReviewRepository.create({
      id: randomUUID(),
      fieldId,
      reviewerId: userId,
      bookingId: dto.bookingId,
      rating: dto.rating,
      comment: dto.comment?.trim() || null,
      isFlagged: false,
    });

    const savedReview = await this.fieldReviewRepository.save(newReview);

    // Tính toán lại summary và điểm Bayesian Ranking
    await this.updateFieldRatingSummary(fieldId);

    return savedReview;
  }

  async getReviews(fieldId: string, page = 1, limit = 10) {
    const { items, total } = await this.fieldReviewRepository.findPageByFieldId(
      fieldId,
      page,
      limit,
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRatingSummary(fieldId: string) {
    const summary =
      await this.fieldRatingSummaryRepository.findByFieldId(fieldId);
    if (!summary) {
      return {
        fieldId,
        avgRating: '0.00',
        totalReviews: 0,
        bayesianScore: '0.000',
      };
    }
    return summary;
  }

  private async updateFieldRatingSummary(fieldId: string): Promise<void> {
    const stats =
      await this.fieldReviewRepository.getRatingStatsByFieldId(fieldId);
    const overall =
      await this.fieldRatingSummaryRepository.getOverallFieldAverage();

    const v = stats.count; // Số lượng review của sân
    const R = stats.avgRating; // Điểm trung bình của sân
    const m = 3; // Ngưỡng review tối thiểu để bình quân hóa
    const C = overall.count > 0 ? overall.avg : 4.0; // Điểm trung bình toàn hệ thống

    // Công thức Bayesian Average: WR = (v / (v + m)) * R + (m / (v + m)) * C
    const bayesianScore = v > 0 ? (v / (v + m)) * R + (m / (v + m)) * C : 0;

    await this.fieldRatingSummaryRepository.upsertSummary(
      fieldId,
      R,
      v,
      bayesianScore,
    );
  }
}
