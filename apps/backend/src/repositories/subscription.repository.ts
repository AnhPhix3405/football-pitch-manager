import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { SubscriptionEntity } from '~/entities/subscription.entity';

@Injectable()
export class SubscriptionRepository extends BaseRepository<SubscriptionEntity> {
  constructor(
    @InjectRepository(SubscriptionEntity)
    repository: Repository<SubscriptionEntity>,
  ) {
    super(repository);
  }

  async findActiveByOwnerId(
    ownerId: string,
  ): Promise<SubscriptionEntity | null> {
    return this.repository.findOne({
      where: { ownerId, status: 'active' },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findExpiringSubscriptions(
    thresholdDays: number = 3,
  ): Promise<SubscriptionEntity[]> {
    const today = dayjs().format('YYYY-MM-DD');
    const futureDate = dayjs().add(thresholdDays, 'day').format('YYYY-MM-DD');

    return this.repository
      .createQueryBuilder('sub')
      .innerJoinAndSelect('sub.plan', 'plan')
      .innerJoinAndSelect('sub.owner', 'owner')
      .where('sub.status = :status', { status: 'active' })
      .andWhere('sub.endDate >= :today', { today })
      .andWhere('sub.endDate <= :futureDate', { futureDate })
      .getMany();
  }

  async findOverdueSubscriptions(): Promise<SubscriptionEntity[]> {
    const today = dayjs().format('YYYY-MM-DD');

    return this.repository
      .createQueryBuilder('sub')
      .where('sub.status = :status', { status: 'active' })
      .andWhere('sub.endDate < :today', { today })
      .getMany();
  }
}
