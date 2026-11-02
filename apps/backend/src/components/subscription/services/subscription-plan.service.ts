import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionPlanEntity } from '~/entities/subscription-plan.entity';
import { SubscriptionPlanRepository } from '~/repositories/subscription-plan.repository';
import { CreateSubscriptionPlanDto } from '../dto/create-subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async createPlan(
    dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanEntity> {
    const plan = this.subscriptionPlanRepository.create({
      name: dto.name,
      price: dto.price.toFixed(2),
      durationDays: dto.durationDays,
      benefit: dto.benefit ?? null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return await this.subscriptionPlanRepository.save(plan);
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

  async deactivatePlan(id: string): Promise<SubscriptionPlanEntity> {
    const plan = await this.getPlanById(id);
    plan.isActive = false;
    return await this.subscriptionPlanRepository.save(plan);
  }
}
