import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionPlanEntity } from '~/entities/subscription-plan.entity';
import { SubscriptionPlanRepository } from '~/repositories/subscription-plan.repository';
import { CreateSubscriptionPlanDto } from '../dto/create-subscription-plan.dto';
import { GetSubscriptionPlansQueryDto } from '../dto/get-subscription-plans-query.dto';
import { UpdateSubscriptionPlanDto } from '../dto/update-subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async createPlan(
    dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    const plan = this.subscriptionPlanRepository.create({
      id: randomUUID(),
      name: dto.name,
      price: dto.price.toFixed(2),
      durationDays: dto.durationDays,
      benefit: dto.benefit ?? null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return await this.subscriptionPlanRepository.save(plan);
  }

  async getAllPlans(
    queryOrAll?: GetSubscriptionPlansQueryDto | boolean,
  ): Promise<SubscriptionPlanEntity[]> {
    if (typeof queryOrAll === 'boolean') {
      return this.subscriptionPlanRepository.findPlansWithFilter({
        status: queryOrAll ? 'ALL' : 'ACTIVE',
      });
    }

    let status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
    if (queryOrAll?.status) {
      status = queryOrAll.status;
    } else if (queryOrAll?.all === 'true') {
      status = 'ALL';
    }

    return this.subscriptionPlanRepository.findPlansWithFilter({
      search: queryOrAll?.search,
      status,
    });
  }

  async getActivePlans(): Promise<SubscriptionPlanEntity[]> {
    return this.subscriptionPlanRepository.findActivePlans();
  }

  async getPlanById(id: string): Promise<SubscriptionPlanEntity> {
    const plan = await this.subscriptionPlanRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('subscriptionPlanNotFound');
    }
    return plan;
  }

  async updatePlan(
    id: string,
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    const plan = await this.getPlanById(id);
    if (dto.name !== undefined) {
      plan.name = dto.name;
    }
    if (dto.price !== undefined) {
      plan.price = dto.price.toFixed(2);
    }
    if (dto.durationDays !== undefined) {
      plan.durationDays = dto.durationDays;
    }
    if (dto.benefit !== undefined) {
      plan.benefit = dto.benefit;
    }
    if (dto.isActive !== undefined) {
      plan.isActive = dto.isActive;
    }
    return await this.subscriptionPlanRepository.save(plan);
  }

  async deactivatePlan(id: string): Promise<SubscriptionPlanEntity> {
    const plan = await this.getPlanById(id);
    plan.isActive = false;
    return await this.subscriptionPlanRepository.save(plan);
  }
}
