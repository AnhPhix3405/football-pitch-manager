jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository, SelectQueryBuilder } from 'typeorm';
import { SubscriptionEntity } from '~/entities/subscription.entity';
import { SubscriptionRepository } from './subscription.repository';

describe('SubscriptionRepository', () => {
  let repository: jest.Mocked<Repository<SubscriptionEntity>>;
  let subRepository: SubscriptionRepository;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<SubscriptionEntity>>;

    subRepository = new SubscriptionRepository(repository);
  });

  it('should find active subscription for owner', async () => {
    const mockSub = {
      id: 'sub-1',
      ownerId: 'owner-1',
      status: 'active',
    } as SubscriptionEntity;
    repository.findOne.mockResolvedValue(mockSub);

    const result = await subRepository.findActiveByOwnerId('owner-1');
    expect(result).toEqual(mockSub);
  });

  it('should query expiring subscriptions', async () => {
    const qb = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'sub-1' }]),
    };
    repository.createQueryBuilder.mockReturnValue(
      qb as unknown as SelectQueryBuilder<SubscriptionEntity>,
    );

    const list = await subRepository.findExpiringSubscriptions(3);
    expect(list).toHaveLength(1);
    expect(qb.where).toHaveBeenCalledWith('sub.status = :status', {
      status: 'active',
    });
  });
});
