jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldReviewEntity } from '~/entities/field-review.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { FieldReviewService } from './field-review.service';
import { RatingSummaryService } from './rating-summary.service';

describe('FieldReviewService', () => {
  let service: FieldReviewService;
  let mockFieldReviewRepo: {
    findByBookingAndReviewer: jest.Mock;
    findByFieldId: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockBookingRepo: {
    findById: jest.Mock;
  };
  let mockRatingSummaryService: {
    recalculateFieldSummary: jest.Mock;
  };

  beforeEach(async () => {
    mockFieldReviewRepo = {
      findByBookingAndReviewer: jest.fn(),
      findByFieldId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockBookingRepo = {
      findById: jest.fn(),
    };
    mockRatingSummaryService = {
      recalculateFieldSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldReviewService,
        {
          provide: FieldReviewRepository,
          useValue: mockFieldReviewRepo,
        },
        {
          provide: BookingRepository,
          useValue: mockBookingRepo,
        },
        {
          provide: RatingSummaryService,
          useValue: mockRatingSummaryService,
        },
      ],
    }).compile();

    service = module.get<FieldReviewService>(FieldReviewService);
  });

  describe('createReview', () => {
    const reviewerId = 'user-uuid-1';
    const dto = {
      bookingId: 'booking-uuid-1',
      rating: 5,
      comment: 'Very good field',
    };

    it('should throw NotFoundException if booking does not exist', async () => {
      mockBookingRepo.findById.mockResolvedValue(null);

      await expect(service.createReview(reviewerId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if booking does not belong to reviewer', async () => {
      mockBookingRepo.findById.mockResolvedValue({
        id: dto.bookingId,
        userId: 'other-user',
        status: 'completed',
      });

      await expect(service.createReview(reviewerId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if booking is not completed', async () => {
      mockBookingRepo.findById.mockResolvedValue({
        id: dto.bookingId,
        userId: reviewerId,
        status: 'confirmed',
      });

      await expect(service.createReview(reviewerId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if booking already reviewed by user', async () => {
      mockBookingRepo.findById.mockResolvedValue({
        id: dto.bookingId,
        userId: reviewerId,
        status: 'completed',
        fieldId: 'field-uuid-1',
      });

      mockFieldReviewRepo.findByBookingAndReviewer.mockResolvedValue({
        id: 'review-uuid-1',
      });

      await expect(service.createReview(reviewerId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should save review and trigger summary recalculation on success', async () => {
      const booking = {
        id: dto.bookingId,
        userId: reviewerId,
        status: 'completed',
        fieldId: 'field-uuid-1',
      } as BookingEntity;

      mockBookingRepo.findById.mockResolvedValue(booking);
      mockFieldReviewRepo.findByBookingAndReviewer.mockResolvedValue(null);

      const createdReview = {
        id: 'review-uuid-new',
        fieldId: booking.fieldId,
        reviewerId,
        bookingId: dto.bookingId,
        rating: dto.rating,
        comment: dto.comment,
        isFlagged: false,
      };

      mockFieldReviewRepo.create.mockReturnValue(createdReview);
      mockFieldReviewRepo.save.mockResolvedValue(createdReview);
      mockRatingSummaryService.recalculateFieldSummary.mockResolvedValue({});

      const result = await service.createReview(reviewerId, dto);

      expect(result).toEqual(createdReview);
      expect(mockFieldReviewRepo.create).toHaveBeenCalled();
      expect(mockFieldReviewRepo.save).toHaveBeenCalled();
      expect(
        mockRatingSummaryService.recalculateFieldSummary,
      ).toHaveBeenCalledWith('field-uuid-1');
    });
  });

  describe('getReviewsByField', () => {
    it('should return paginated review list', async () => {
      const reviews = [{ id: 'rev-1', rating: 5 }] as FieldReviewEntity[];
      mockFieldReviewRepo.findByFieldId.mockResolvedValue({
        items: reviews,
        total: 1,
      });

      const result = await service.getReviewsByField('field-1', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(reviews);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('getReviewById', () => {
    it('should throw NotFoundException if review does not exist', async () => {
      mockFieldReviewRepo.findById.mockResolvedValue(null);

      await expect(service.getReviewById('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return review when found', async () => {
      const review = { id: 'rev-1', rating: 5 } as FieldReviewEntity;
      mockFieldReviewRepo.findById.mockResolvedValue(review);

      const result = await service.getReviewById('rev-1');
      expect(result).toEqual(review);
    });
  });
});
