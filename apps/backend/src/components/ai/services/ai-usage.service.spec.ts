jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AiUsageLogRepository } from '~/repositories/ai-usage-log.repository';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { AiUsageService } from './ai-usage.service';

describe('AiUsageService', () => {
  let service: AiUsageService;
  let mockAiRepo: {
    logUsage: jest.Mock;
    countRequestsSince: jest.Mock;
    sumTokensSince: jest.Mock;
  };
  let mockSubRepo: {
    findActiveByOwnerId: jest.Mock;
  };

  beforeEach(async () => {
    mockAiRepo = {
      logUsage: jest.fn(),
      countRequestsSince: jest.fn(),
      sumTokensSince: jest.fn(),
    };
    mockSubRepo = {
      findActiveByOwnerId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiUsageService,
        {
          provide: AiUsageLogRepository,
          useValue: mockAiRepo,
        },
        {
          provide: SubscriptionRepository,
          useValue: mockSubRepo,
        },
      ],
    }).compile();

    service = module.get<AiUsageService>(AiUsageService);
  });

  describe('getUserQuotaStatus', () => {
    it('should calculate free tier quota if no active subscription', async () => {
      mockAiRepo.countRequestsSince.mockResolvedValue(1);
      mockAiRepo.sumTokensSince.mockResolvedValue(150);
      mockSubRepo.findActiveByOwnerId.mockResolvedValue(null);

      const status = await service.getUserQuotaStatus('user-1');

      expect(status.dailyRequestsUsed).toBe(1);
      expect(status.dailyQuota).toBe(3);
      expect(status.remainingRequests).toBe(2);
      expect(status.totalTokensUsed).toBe(150);
    });

    it('should calculate customized tier quota from plan benefit', async () => {
      mockAiRepo.countRequestsSince.mockResolvedValue(5);
      mockAiRepo.sumTokensSince.mockResolvedValue(800);
      mockSubRepo.findActiveByOwnerId.mockResolvedValue({
        plan: {
          benefit: {
            aiQuotaDaily: 100,
          },
        },
      });

      const status = await service.getUserQuotaStatus('user-vip');

      expect(status.dailyRequestsUsed).toBe(5);
      expect(status.dailyQuota).toBe(100);
      expect(status.remainingRequests).toBe(95);
      expect(status.totalTokensUsed).toBe(800);
    });
  });
});
