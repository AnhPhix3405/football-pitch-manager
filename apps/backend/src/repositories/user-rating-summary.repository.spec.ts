jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { UserRatingSummaryEntity } from '~/entities/user-rating-summary.entity';
import { UserRatingSummaryRepository } from './user-rating-summary.repository';

describe('UserRatingSummaryRepository', () => {
  let repository: jest.Mocked<Repository<UserRatingSummaryEntity>>;
  let summaryRepository: UserRatingSummaryRepository;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserRatingSummaryEntity>>;

    summaryRepository = new UserRatingSummaryRepository(repository);
  });

  it('should find user rating summary by userId', async () => {
    const mockSummary = {
      userId: 'u-1',
      avgRating: '4.90',
      totalReviews: 8,
    } as UserRatingSummaryEntity;
    repository.findOne.mockResolvedValue(mockSummary);

    const result = await summaryRepository.findByUserId('u-1');
    expect(result).toEqual(mockSummary);
  });
});
