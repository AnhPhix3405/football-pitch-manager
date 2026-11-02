jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { SubscriptionPlanEntity } from '~/entities/subscription-plan.entity';
import { SubscriptionPlanRepository } from './subscription-plan.repository';

describe('SubscriptionPlanRepository', () => {
  let repository: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let planRepository: SubscriptionPlanRepository;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    planRepository = new SubscriptionPlanRepository(
      repository as unknown as Repository<SubscriptionPlanEntity>,
    );
  });

  it('should find active plans ordered by price ASC', async () => {
    const mockPlans = [
      { id: 'plan-1', name: 'Basic', isActive: true },
    ] as SubscriptionPlanEntity[];
    repository.find.mockResolvedValue(mockPlans);

    const result = await planRepository.findActivePlans();
    expect(result).toEqual(mockPlans);
    expect(repository.find).toHaveBeenCalledWith({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  });
});
