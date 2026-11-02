import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AiUsageLogEntity } from '~/entities/ai-usage-log.entity';

@Injectable()
export class AiUsageLogRepository {
  constructor(
    @InjectRepository(AiUsageLogEntity)
    private readonly repository: Repository<AiUsageLogEntity>,
  ) {}

  async logUsage(
    userId: string,
    feature: string,
    tokensUsed: number,
  ): Promise<AiUsageLogEntity> {
    const entry = this.repository.create({
      id: randomUUID(),
      userId,
      feature,
      tokensUsed,
    });
    return this.repository.save(entry);
  }

  async countRequestsSince(userId: string, since: Date): Promise<number> {
    return this.repository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :since', { since })
      .getCount();
  }

  async sumTokensSince(userId: string, since: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('log')
      .select('SUM(log.tokensUsed)', 'totalTokens')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :since', { since })
      .getRawOne<{ totalTokens: string | null }>();

    return Number(result?.totalTokens || 0);
  }

  async getUserHistory(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<{ items: AiUsageLogEntity[]; total: number }> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }
}
