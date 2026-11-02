jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlanEntity } from '~/entities/subscription-plan.entity';
import { SubscriptionPlanRepository } from '~/repositories/subscription-plan.repository';
import { SubscriptionPlanService } from './subscription-plan.service';

describe('SubscriptionPlanService', () => {
  let service: SubscriptionPlanService;
  let mockPlanRepo: {
    findActivePlans: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    mockPlanRepo = {
      findActivePlans: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionPlanService,
        {
          provide: SubscriptionPlanRepository,
          useValue: mockPlanRepo,
        },
      ],
    }).compile();

    service = module.get<SubscriptionPlanService>(SubscriptionPlanService);
  });

  describe('createPlan', () => {
    it('should create and save subscription plan', async () => {
      const dto = {
        name: 'VIP Plan',
        price: 299000,
        durationDays: 30,
        benefit: { aiQuotaDaily: 100 },
      };
      const created = {
        id: 'plan-1',
        ...dto,
        price: '299000.00',
        isActive: true,
      };
      mockPlanRepo.create.mockReturnValue(created);
      mockPlanRepo.save.mockResolvedValue(created);

      const result = await service.createPlan(dto);
      expect(result).toEqual(created);
      expect(mockPlanRepo.create).toHaveBeenCalled();
      expect(mockPlanRepo.save).toHaveBeenCalled();
    });
  });

  describe('getActivePlans', () => {
    it('should return list of active plans', async () => {
      const plans = [{ id: 'p-1', name: 'Plan 1' }] as SubscriptionPlanEntity[];
      mockPlanRepo.findActivePlans.mockResolvedValue(plans);

      const result = await service.getActivePlans();
      expect(result).toEqual(plans);
    });
  });

  describe('getPlanById and deactivatePlan', () => {
    it('should throw NotFoundException if plan does not exist', async () => {
      mockPlanRepo.findById.mockResolvedValue(null);

      await expect(service.getPlanById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should deactivate plan and save', async () => {
      const plan = { id: 'p-1', isActive: true } as SubscriptionPlanEntity;
      mockPlanRepo.findById.mockResolvedValue(plan);
      mockPlanRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.deactivatePlan('p-1');
      expect(result.isActive).toBe(false);
      expect(mockPlanRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });
});
