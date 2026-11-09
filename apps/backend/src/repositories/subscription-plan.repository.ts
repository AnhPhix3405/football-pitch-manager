import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { SubscriptionPlanEntity } from '~/entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlanEntity> {
  constructor(
    @InjectRepository(SubscriptionPlanEntity)
    repository: Repository<SubscriptionPlanEntity>,
  ) {
    super(repository);
  }

  async findActivePlans(): Promise<SubscriptionPlanEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async findAllPlans(): Promise<SubscriptionPlanEntity[]> {
    return this.repository.find({
      order: { price: 'ASC' },
    });
  }

  async findPlansWithFilter(options?: {
    search?: string;
    status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
  }): Promise<SubscriptionPlanEntity[]> {
    const qb = this.repository.createQueryBuilder('plan');

    const status = options?.status ?? 'ACTIVE';
    if (status === 'ACTIVE') {
      qb.andWhere('plan.isActive = :isActive', { isActive: true });
    } else if (status === 'INACTIVE') {
      qb.andWhere('plan.isActive = :isActive', { isActive: false });
    }

    if (options?.search && options.search.trim() !== '') {
      qb.andWhere('plan.name ILIKE :search', {
        search: `%${options.search.trim()}%`,
      });
    }

    qb.orderBy('plan.price', 'ASC');
    return qb.getMany();
  }
}
