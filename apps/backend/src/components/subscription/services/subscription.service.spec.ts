jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionEntity } from '~/entities/subscription.entity';
import { SubscriptionPlanRepository } from '~/repositories/subscription-plan.repository';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constant';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockSubRepo: {
    findActiveByOwnerId: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockPlanRepo: {
    findById: jest.Mock;
  };

  beforeEach(async () => {
    mockSubRepo = {
      findActiveByOwnerId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockPlanRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useValue: mockSubRepo,
        },
        {
          provide: SubscriptionPlanRepository,
          useValue: mockPlanRepo,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  describe('subscribe', () => {
    const userId = 'user-1';
    const planId = 'plan-1';

    it('should throw BadRequestException if user already has an active subscription', async () => {
      mockSubRepo.findActiveByOwnerId.mockResolvedValue({
        id: 'sub-active',
      });

      await expect(service.subscribe(userId, { planId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if plan does not exist', async () => {
      mockSubRepo.findActiveByOwnerId.mockResolvedValue(null);
      mockPlanRepo.findById.mockResolvedValue(null);

      await expect(service.subscribe(userId, { planId })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if plan is inactive', async () => {
      mockSubRepo.findActiveByOwnerId.mockResolvedValue(null);
      mockPlanRepo.findById.mockResolvedValue({
        id: planId,
        isActive: false,
      });

      await expect(service.subscribe(userId, { planId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create and save active subscription on success', async () => {
      mockSubRepo.findActiveByOwnerId.mockResolvedValue(null);
      mockPlanRepo.findById.mockResolvedValue({
        id: planId,
        durationDays: 30,
        isActive: true,
      });

      const created = {
        id: 'sub-new',
        ownerId: userId,
        planId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      };

      mockSubRepo.create.mockReturnValue(created);
      mockSubRepo.save.mockResolvedValue(created);

      const result = await service.subscribe(userId, { planId });

      expect(result).toEqual(created);
      expect(mockSubRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: userId,
          planId,
          status: SUBSCRIPTION_STATUS.ACTIVE,
        }),
      );
      expect(mockSubRepo.save).toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('should throw NotFoundException if subscription not found', async () => {
      mockSubRepo.findById.mockResolvedValue(null);

      await expect(
        service.cancelSubscription('user-1', 'sub-unknown'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockSubRepo.findById.mockResolvedValue({
        id: 'sub-1',
        ownerId: 'different-user',
      });

      await expect(
        service.cancelSubscription('user-1', 'sub-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update status to cancelled on success', async () => {
      const sub = {
        id: 'sub-1',
        ownerId: 'user-1',
        status: SUBSCRIPTION_STATUS.ACTIVE,
      } as SubscriptionEntity;
      mockSubRepo.findById.mockResolvedValue(sub);
      mockSubRepo.save.mockImplementation((s) => Promise.resolve(s));

      const result = await service.cancelSubscription('user-1', 'sub-1');
      expect(result.status).toBe(SUBSCRIPTION_STATUS.CANCELLED);
      expect(mockSubRepo.save).toHaveBeenCalled();
    });
  });
});
