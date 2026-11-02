jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FieldReviewEntity } from '~/entities/field-review.entity';
import { UserReviewEntity } from '~/entities/user-review.entity';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { MODERATION_ACTION } from '../constants/review.constant';
import { RatingSummaryService } from './rating-summary.service';
import { ReviewModerationService } from './review-moderation.service';

describe('ReviewModerationService', () => {
  let service: ReviewModerationService;
  let mockFieldReviewRepo: {
    findById: jest.Mock;
    save: jest.Mock;
  };
  let mockUserReviewRepo: {
    findById: jest.Mock;
    save: jest.Mock;
  };
  let mockRatingSummaryService: {
    recalculateFieldSummary: jest.Mock;
    recalculateUserSummary: jest.Mock;
  };

  beforeEach(async () => {
    mockFieldReviewRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockUserReviewRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockRatingSummaryService = {
      recalculateFieldSummary: jest.fn(),
      recalculateUserSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewModerationService,
        {
          provide: FieldReviewRepository,
          useValue: mockFieldReviewRepo,
        },
        {
          provide: UserReviewRepository,
          useValue: mockUserReviewRepo,
        },
        {
          provide: RatingSummaryService,
          useValue: mockRatingSummaryService,
        },
      ],
    }).compile();

    service = module.get<ReviewModerationService>(ReviewModerationService);
  });

  describe('reportFieldReview', () => {
    it('should throw NotFoundException if review not found', async () => {
      mockFieldReviewRepo.findById.mockResolvedValue(null);

      await expect(
        service.reportFieldReview('rev-1', 'Spam content'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set isFlagged and flagReason on field review', async () => {
      const review = { id: 'rev-1', isFlagged: false } as FieldReviewEntity;
      mockFieldReviewRepo.findById.mockResolvedValue(review);
      mockFieldReviewRepo.save.mockImplementation((r) => Promise.resolve(r));

      const result = await service.reportFieldReview('rev-1', 'Spam');
      expect(result.isFlagged).toBe(true);
      expect(result.flagReason).toBe('Spam');
      expect(mockFieldReviewRepo.save).toHaveBeenCalled();
    });
  });

  describe('moderateFieldReview', () => {
    it('should dismiss report by clearing flag', async () => {
      const review = {
        id: 'rev-1',
        isFlagged: true,
        flagReason: 'Spam',
      } as FieldReviewEntity;
      mockFieldReviewRepo.findById.mockResolvedValue(review);
      mockFieldReviewRepo.save.mockImplementation((r) => Promise.resolve(r));

      const result = await service.moderateFieldReview(
        'rev-1',
        MODERATION_ACTION.DISMISS,
      );

      expect(result.isFlagged).toBe(false);
      expect(result.flagReason).toBeNull();
      expect(
        mockRatingSummaryService.recalculateFieldSummary,
      ).not.toHaveBeenCalled();
    });

    it('should hide review and trigger summary recalculation', async () => {
      const review = {
        id: 'rev-1',
        fieldId: 'field-1',
        isFlagged: true,
      } as FieldReviewEntity;
      mockFieldReviewRepo.findById.mockResolvedValue(review);
      mockFieldReviewRepo.save.mockImplementation((r) => Promise.resolve(r));

      const result = await service.moderateFieldReview(
        'rev-1',
        MODERATION_ACTION.HIDE,
        'Violates terms',
      );

      expect(result.isFlagged).toBe(true);
      expect(result.flagReason).toBe('HIDDEN: Violates terms');
      expect(
        mockRatingSummaryService.recalculateFieldSummary,
      ).toHaveBeenCalledWith('field-1');
    });
  });

  describe('reportUserReview & moderateUserReview', () => {
    it('should handle user review reporting and moderation', async () => {
      const userReview = {
        id: 'u-rev-1',
        targetUserId: 'target-1',
        isFlagged: false,
      } as UserReviewEntity;
      mockUserReviewRepo.findById.mockResolvedValue(userReview);
      mockUserReviewRepo.save.mockImplementation((r) => Promise.resolve(r));

      await service.reportUserReview('u-rev-1', 'Abusive language');
      expect(userReview.isFlagged).toBe(true);

      await service.moderateUserReview(
        'u-rev-1',
        MODERATION_ACTION.HIDE,
        'Abusive language confirmed',
      );
      expect(
        mockRatingSummaryService.recalculateUserSummary,
      ).toHaveBeenCalledWith('target-1');
    });
  });
});
