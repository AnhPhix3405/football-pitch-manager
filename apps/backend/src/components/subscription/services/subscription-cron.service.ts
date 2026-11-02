import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.constant';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionLifecycle(): Promise<{
    expiringSoonCount: number;
    expiredCount: number;
  }> {
    this.logger.log('Running daily subscription lifecycle check...');

    // 1. Check subscriptions expiring in next 3 days
    const expiringSoon =
      await this.subscriptionRepository.findExpiringSubscriptions(3);
    for (const sub of expiringSoon) {
      this.logger.log(
        `Subscription ${sub.id} of owner ${sub.ownerId} expires on ${sub.endDate}`,
      );
    }

    // 2. Process overdue active subscriptions
    const overdue =
      await this.subscriptionRepository.findOverdueSubscriptions();
    let expiredCount = 0;
    for (const sub of overdue) {
      sub.status = SUBSCRIPTION_STATUS.EXPIRED;
      await this.subscriptionRepository.save(sub);
      expiredCount++;
    }

    this.logger.log(
      `Subscription check completed: ${expiringSoon.length} expiring soon, ${expiredCount} expired.`,
    );

    return {
      expiringSoonCount: expiringSoon.length,
      expiredCount,
    };
  }
}
