jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FieldRatingSummaryEntity } from '~/entities/field-rating-summary.entity';
import { UserRatingSummaryEntity } from '~/entities/user-rating-summary.entity';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { FieldReviewRepository } from '~/repositories/field-review.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { RatingSummaryService } from './rating-summary.service';

describe('RatingSummaryService', () => {
  let service: RatingSummaryService;
  let mockFieldReviewRepo: {
    calculateSummary: jest.Mock;
  };
  let mockUserReviewRepo: {
    calculateSummary: jest.Mock;
  };
  let mockFieldRatingSummaryRepo: {
    findByFieldId: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockUserRatingSummaryRepo: {
    findByUserId: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    mockFieldReviewRepo = {
      calculateSummary: jest.fn(),
    };
    mockUserReviewRepo = {
      calculateSummary: jest.fn(),
    };
    mockFieldRatingSummaryRepo = {
      findByFieldId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockUserRatingSummaryRepo = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingSummaryService,
        {
          provide: FieldReviewRepository,
          useValue: mockFieldReviewRepo,
        },
        {
          provide: UserReviewRepository,
          useValue: mockUserReviewRepo,
        },
        {
          provide: FieldRatingSummaryRepository,
          useValue: mockFieldRatingSummaryRepo,
        },
        {
          provide: UserRatingSummaryRepository,
          useValue: mockUserRatingSummaryRepo,
        },
      ],
    }).compile();

    service = module.get<RatingSummaryService>(RatingSummaryService);
  });

  describe('calculateBayesianScore', () => {
    it('should return 0 when totalReviews is 0', () => {
      expect(service.calculateBayesianScore(0, 0)).toBe(0);
    });

    it('should correctly calculate bayesian weighted score', () => {
      // C = 5, M = 3.5, totalReviews = 5, avgRating = 5.0
      // (5 * 3.5 + 5 * 5.0) / (5 + 5) = (17.5 + 25) / 10 = 42.5 / 10 = 4.25
      const score = service.calculateBayesianScore(5, 5.0);
      expect(score).toBeCloseTo(4.25, 2);
    });
  });

  describe('recalculateFieldSummary', () => {
    it('should calculate stats and create new summary if none exists', async () => {
      mockFieldReviewRepo.calculateSummary.mockResolvedValue({
        totalReviews: 4,
        avgRating: 4.5,
      });
      mockFieldRatingSummaryRepo.findByFieldId.mockResolvedValue(null);
      mockFieldRatingSummaryRepo.create.mockImplementation(
        (dto: Partial<FieldRatingSummaryEntity>) =>
          dto as FieldRatingSummaryEntity,
      );
      mockFieldRatingSummaryRepo.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.recalculateFieldSummary('field-uuid-1');

      expect(result.fieldId).toBe('field-uuid-1');
      expect(result.avgRating).toBe('4.50');
      expect(result.totalReviews).toBe(4);
      expect(mockFieldRatingSummaryRepo.create).toHaveBeenCalled();
      expect(mockFieldRatingSummaryRepo.save).toHaveBeenCalled();
    });

    it('should update existing summary if found', async () => {
      mockFieldReviewRepo.calculateSummary.mockResolvedValue({
        totalReviews: 10,
        avgRating: 4.8,
      });
      const existingSummary = {
        fieldId: 'field-uuid-1',
        avgRating: '4.00',
        totalReviews: 2,
        bayesianScore: '3.64',
        version: 1,
      };
      mockFieldRatingSummaryRepo.findByFieldId.mockResolvedValue(
        existingSummary,
      );
      mockFieldRatingSummaryRepo.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.recalculateFieldSummary('field-uuid-1');

      expect(result.avgRating).toBe('4.80');
      expect(result.totalReviews).toBe(10);
      expect(mockFieldRatingSummaryRepo.create).not.toHaveBeenCalled();
      expect(mockFieldRatingSummaryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldId: 'field-uuid-1',
          avgRating: '4.80',
          totalReviews: 10,
        }),
      );
    });
  });

  describe('recalculateUserSummary', () => {
    it('should calculate stats and create new user rating summary', async () => {
      mockUserReviewRepo.calculateSummary.mockResolvedValue({
        totalReviews: 2,
        avgRating: 5.0,
      });
      mockUserRatingSummaryRepo.findByUserId.mockResolvedValue(null);
      mockUserRatingSummaryRepo.create.mockImplementation(
        (dto: Partial<UserRatingSummaryEntity>) =>
          dto as UserRatingSummaryEntity,
      );
      mockUserRatingSummaryRepo.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.recalculateUserSummary('user-uuid-1');

      expect(result.userId).toBe('user-uuid-1');
      expect(result.avgRating).toBe('5.00');
      expect(result.totalReviews).toBe(2);
      expect(mockUserRatingSummaryRepo.save).toHaveBeenCalled();
    });
  });

  describe('getFieldSummary and getUserSummary', () => {
    it('should return default summary when not found', async () => {
      mockFieldRatingSummaryRepo.findByFieldId.mockResolvedValue(null);
      mockUserRatingSummaryRepo.findByUserId.mockResolvedValue(null);

      const fieldRes = await service.getFieldSummary('non-existent');
      expect(fieldRes.totalReviews).toBe(0);
      expect(fieldRes.avgRating).toBe('0.00');

      const userRes = await service.getUserSummary('non-existent');
      expect(userRes.totalReviews).toBe(0);
      expect(userRes.avgRating).toBe('0.00');
    });
  });
});
