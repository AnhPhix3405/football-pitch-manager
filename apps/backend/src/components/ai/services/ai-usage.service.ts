import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { AiUsageLogEntity } from '~/entities/ai-usage-log.entity';
import { AiUsageLogRepository } from '~/repositories/ai-usage-log.repository';
import { SubscriptionRepository } from '~/repositories/subscription.repository';
import { DEFAULT_AI_QUOTAS } from '../../subscription/constants/subscription.constant';
import { AiUserQuotaStatus } from '../interfaces/ai.interface';

@Injectable()
export class AiUsageService {
  constructor(
    private readonly aiUsageLogRepository: AiUsageLogRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async logUsage(
    userId: string,
    feature: string,
    tokensUsed: number,
  ): Promise<AiUsageLogEntity> {
    return this.aiUsageLogRepository.logUsage(userId, feature, tokensUsed);
  }

  async getUserQuotaStatus(userId: string): Promise<AiUserQuotaStatus> {
    const startOfDay = dayjs().startOf('day').toDate();

    const usedToday = await this.aiUsageLogRepository.countRequestsSince(
      userId,
      startOfDay,
    );
    const tokensToday = await this.aiUsageLogRepository.sumTokensSince(
      userId,
      startOfDay,
    );

    const activeSub =
      await this.subscriptionRepository.findActiveByOwnerId(userId);

    let quota: number = DEFAULT_AI_QUOTAS.FREE_DAILY_REQUESTS;
    const planBenefit = activeSub?.plan?.benefit as
      { aiQuotaDaily?: number } | undefined;
    if (planBenefit && typeof planBenefit.aiQuotaDaily === 'number') {
      quota = planBenefit.aiQuotaDaily;
    }

    return {
      dailyRequestsUsed: usedToday,
      dailyQuota: quota,
      remainingRequests: Math.max(0, quota - usedToday),
      totalTokensUsed: tokensToday,
    };
  }
}
