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
    findAllPlans: jest.Mock;
    findPlansWithFilter: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    mockPlanRepo = {
      findActivePlans: jest.fn(),
      findAllPlans: jest.fn(),
      findPlansWithFilter: jest.fn(),
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
      expect(mockPlanRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          name: dto.name,
          price: '299000.00',
          durationDays: dto.durationDays,
          benefit: dto.benefit,
          isActive: true,
        }),
      );
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

  describe('getAllPlans', () => {
    it('should query with status ALL when all is true', async () => {
      const allPlans = [
        { id: 'p-1', name: 'Plan 1', isActive: true },
        { id: 'p-2', name: 'Plan 2', isActive: false },
      ] as SubscriptionPlanEntity[];
      mockPlanRepo.findPlansWithFilter.mockResolvedValue(allPlans);

      const result = await service.getAllPlans(true);
      expect(result).toEqual(allPlans);
      expect(mockPlanRepo.findPlansWithFilter).toHaveBeenCalledWith({
        status: 'ALL',
      });
    });

    it('should query with status ACTIVE when all is false', async () => {
      const activePlans = [
        { id: 'p-1', name: 'Plan 1', isActive: true },
      ] as SubscriptionPlanEntity[];
      mockPlanRepo.findPlansWithFilter.mockResolvedValue(activePlans);

      const result = await service.getAllPlans(false);
      expect(result).toEqual(activePlans);
      expect(mockPlanRepo.findPlansWithFilter).toHaveBeenCalledWith({
        status: 'ACTIVE',
      });
    });

    it('should query with search keyword and specific status from DTO', async () => {
      const filtered = [
        { id: 'p-2', name: 'Pro Plan', isActive: false },
      ] as SubscriptionPlanEntity[];
      mockPlanRepo.findPlansWithFilter.mockResolvedValue(filtered);

      const result = await service.getAllPlans({
        search: 'Pro',
        status: 'INACTIVE',
      });
      expect(result).toEqual(filtered);
      expect(mockPlanRepo.findPlansWithFilter).toHaveBeenCalledWith({
        search: 'Pro',
        status: 'INACTIVE',
      });
    });
  });

  describe('updatePlan', () => {
    it('should update plan fields and return saved entity', async () => {
      const existingPlan = {
        id: 'p-1',
        name: 'Old Name',
        price: '100000.00',
        durationDays: 30,
        benefit: null,
        isActive: true,
      } as SubscriptionPlanEntity;

      mockPlanRepo.findById.mockResolvedValue(existingPlan);
      mockPlanRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.updatePlan('p-1', {
        name: 'New Name',
        price: 150000,
        durationDays: 60,
        benefit: { features: ['Feature 1'] },
        isActive: false,
      });

      expect(result.name).toBe('New Name');
      expect(result.price).toBe('150000.00');
      expect(result.durationDays).toBe(60);
      expect(result.benefit).toEqual({ features: ['Feature 1'] });
      expect(result.isActive).toBe(false);
      expect(mockPlanRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if plan does not exist during update', async () => {
      mockPlanRepo.findById.mockResolvedValue(null);

      await expect(
        service.updatePlan('unknown', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
