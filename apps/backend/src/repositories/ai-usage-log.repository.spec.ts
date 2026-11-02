jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { AiUsageLogEntity } from '~/entities/ai-usage-log.entity';
import { AiUsageLogRepository } from './ai-usage-log.repository';

describe('AiUsageLogRepository', () => {
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let aiLogRepository: AiUsageLogRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    aiLogRepository = new AiUsageLogRepository(
      repository as unknown as Repository<AiUsageLogEntity>,
    );
  });

  it('should log AI usage', async () => {
    const mockLog = {
      id: 'log-1',
      userId: 'u-1',
      feature: 'match_suggestion',
      tokensUsed: 150,
    } as AiUsageLogEntity;
    repository.create.mockReturnValue(mockLog);
    repository.save.mockResolvedValue(mockLog);

    const result = await aiLogRepository.logUsage(
      'u-1',
      'match_suggestion',
      150,
    );
    expect(result).toEqual(mockLog);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u-1', tokensUsed: 150 }),
    );
  });

  it('should sum tokens used since a given date', async () => {
    const qb = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ totalTokens: '500' }),
    };
    repository.createQueryBuilder.mockReturnValue(qb);

    const total = await aiLogRepository.sumTokensSince('u-1', new Date());
    expect(total).toBe(500);
  });
});
