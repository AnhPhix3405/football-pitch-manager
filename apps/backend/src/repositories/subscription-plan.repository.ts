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
}
