jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';
import { AiFoundationService } from './ai-foundation.service';
import { AiUsageService } from './ai-usage.service';

describe('AiFoundationService', () => {
  let service: AiFoundationService;
  let mockConfigService: {
    get: jest.Mock;
  };
  let mockPostRepo: {
    findById: jest.Mock;
  };
  let mockPostMatchRepo: {
    findByPostId: jest.Mock;
  };
  let mockUserRatingSummaryRepo: {
    findByUserId: jest.Mock;
  };
  let mockAiUsageService: {
    logUsage: jest.Mock;
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    };
    mockPostRepo = {
      findById: jest.fn(),
    };
    mockPostMatchRepo = {
      findByPostId: jest.fn(),
    };
    mockUserRatingSummaryRepo = {
      findByUserId: jest.fn(),
    };
    mockAiUsageService = {
      logUsage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiFoundationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PostRepository,
          useValue: mockPostRepo,
        },
        {
          provide: PostMatchRepository,
          useValue: mockPostMatchRepo,
        },
        {
          provide: UserRatingSummaryRepository,
          useValue: mockUserRatingSummaryRepo,
        },
        {
          provide: AiUsageService,
          useValue: mockAiUsageService,
        },
      ],
    }).compile();

    service = module.get<AiFoundationService>(AiFoundationService);
  });

  describe('getMatchmakingSuggestion', () => {
    it('should throw NotFoundException if post not found', async () => {
      mockPostRepo.findById.mockResolvedValue(null);

      await expect(
        service.getMatchmakingSuggestion('user-1', 'post-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return 0 compatibility when no pending applicants exist', async () => {
      mockPostRepo.findById.mockResolvedValue({ id: 'post-1' });
      mockPostMatchRepo.findByPostId.mockResolvedValue([
        { applicantId: 'user-2', status: 'accepted' },
      ] as PostMatchEntity[]);

      const result = await service.getMatchmakingSuggestion('user-1', 'post-1');

      expect(result.recommendedUserId).toBeNull();
      expect(result.compatibilityScore).toBe(0);
      expect(mockAiUsageService.logUsage).not.toHaveBeenCalled();
    });

    it('should recommend best candidate based on sportsmanship and experience', async () => {
      mockPostRepo.findById.mockResolvedValue({ id: 'post-1' });
      mockPostMatchRepo.findByPostId.mockResolvedValue([
        { applicantId: 'candidate-1', status: 'pending' },
        { applicantId: 'candidate-2', status: 'pending' },
      ] as PostMatchEntity[]);

      mockUserRatingSummaryRepo.findByUserId
        .mockResolvedValueOnce({
          userId: 'candidate-1',
          sportsmanshipScore: '3.00',
          totalReviews: 1,
        })
        .mockResolvedValueOnce({
          userId: 'candidate-2',
          sportsmanshipScore: '5.00',
          totalReviews: 10,
        });

      mockAiUsageService.logUsage.mockResolvedValue({});

      const result = await service.getMatchmakingSuggestion('user-1', 'post-1');

      expect(result.recommendedUserId).toBe('candidate-2');
      expect(result.compatibilityScore).toBeGreaterThan(80);
      expect(mockAiUsageService.logUsage).toHaveBeenCalled();
    });
  });
});
