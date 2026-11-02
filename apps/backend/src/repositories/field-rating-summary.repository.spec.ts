jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository, SelectQueryBuilder } from 'typeorm';
import { FieldRatingSummaryEntity } from '~/entities/field-rating-summary.entity';
import { FieldRatingSummaryRepository } from './field-rating-summary.repository';

describe('FieldRatingSummaryRepository', () => {
  let repository: jest.Mocked<Repository<FieldRatingSummaryEntity>>;
  let summaryRepository: FieldRatingSummaryRepository;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<FieldRatingSummaryEntity>>;

    summaryRepository = new FieldRatingSummaryRepository(repository);
  });

  it('should find rating summary by fieldId', async () => {
    const mockSummary = {
      fieldId: 'f-1',
      avgRating: '4.50',
      totalReviews: 12,
    } as FieldRatingSummaryEntity;
    repository.findOne.mockResolvedValue(mockSummary);

    const result = await summaryRepository.findByFieldId('f-1');
    expect(result).toEqual(mockSummary);
  });

  it('should query top ranked fields by bayesianScore', async () => {
    const qb = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ fieldId: 'f-1' }]),
    };
    repository.createQueryBuilder.mockReturnValue(
      qb as unknown as SelectQueryBuilder<FieldRatingSummaryEntity>,
    );

    const results = await summaryRepository.findTopRanked({ limit: 5 });
    expect(results).toHaveLength(1);
    expect(qb.orderBy).toHaveBeenCalledWith('summary.bayesianScore', 'DESC');
  });
});
