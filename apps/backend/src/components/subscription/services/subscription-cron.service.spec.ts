jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => undefined,
  CronExpression: {
    EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionEntity } from '~/entities/subscription.entity';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constant';
import { SubscriptionCronService } from './subscription-cron.service';

describe('SubscriptionCronService', () => {
  let service: SubscriptionCronService;
  let mockSubRepo: {
    findExpiringSubscriptions: jest.Mock;
    findOverdueSubscriptions: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    mockSubRepo = {
      findExpiringSubscriptions: jest.fn(),
      findOverdueSubscriptions: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionCronService,
        {
          provide: SubscriptionRepository,
          useValue: mockSubRepo,
        },
      ],
    }).compile();

    service = module.get<SubscriptionCronService>(SubscriptionCronService);
  });

  it('should find expiring and mark overdue subscriptions as expired', async () => {
    mockSubRepo.findExpiringSubscriptions.mockResolvedValue([
      { id: 'sub-expiring', ownerId: 'user-1', endDate: '2026-11-03' },
    ]);

    const overdueSub = {
      id: 'sub-overdue',
      status: SUBSCRIPTION_STATUS.ACTIVE,
    } as SubscriptionEntity;
    mockSubRepo.findOverdueSubscriptions.mockResolvedValue([overdueSub]);
    mockSubRepo.save.mockImplementation((s) => Promise.resolve(s));

    const result = await service.handleSubscriptionLifecycle();

    expect(result.expiringSoonCount).toBe(1);
    expect(result.expiredCount).toBe(1);
    expect(overdueSub.status).toBe(SUBSCRIPTION_STATUS.EXPIRED);
    expect(mockSubRepo.save).toHaveBeenCalledWith(overdueSub);
  });
});
