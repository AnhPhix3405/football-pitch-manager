import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { SubscriptionEntity } from '~/entities/subscription.entity';
import { SubscriptionPlanRepository } from '~/repositories/subscription-plan.repository';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constant';
import { SubscribePlanDto } from '../dto/subscribe-plan.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async subscribe(
    userId: string,
    dto: SubscribePlanDto,
  ): Promise<SubscriptionEntity> {
    const activeSub =
      await this.subscriptionRepository.findActiveByOwnerId(userId);
    if (activeSub) {
      throw new BadRequestException('subscriptionAlreadyActive');
    }

    const plan = await this.subscriptionPlanRepository.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException('subscriptionPlanNotFound');
    }

    if (!plan.isActive) {
      throw new BadRequestException('subscriptionPlanInactive');
    }

    const startDate = dayjs().format('YYYY-MM-DD');
    const endDate = dayjs().add(plan.durationDays, 'day').format('YYYY-MM-DD');

    const subscription = this.subscriptionRepository.create({
      id: randomUUID(),
      ownerId: userId,
      planId: plan.id,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      startDate,
      endDate,
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async getMyActiveSubscription(
    userId: string,
  ): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findActiveByOwnerId(userId);
  }

  async cancelSubscription(
    userId: string,
    id: string,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new NotFoundException('subscriptionNotFound');
    }

    if (subscription.ownerId !== userId) {
      throw new ForbiddenException('unauthorizedAccess');
    }

    subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
    return await this.subscriptionRepository.save(subscription);
  }
}
