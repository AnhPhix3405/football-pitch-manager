jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserReviewEntity } from '~/entities/user-review.entity';
import { UserReviewRepository } from './user-review.repository';

describe('UserReviewRepository', () => {
  let repository: jest.Mocked<Repository<UserReviewEntity>>;
  let userReviewRepository: UserReviewRepository;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserReviewEntity>>;

    userReviewRepository = new UserReviewRepository(repository);
  });

  it('should find user review by post, target user and reviewer', async () => {
    const mockReview = {
      id: 'ur-1',
      postId: 'p-1',
      targetUserId: 'u-2',
      reviewerId: 'u-1',
    } as UserReviewEntity;
    repository.findOne.mockResolvedValue(mockReview);

    const result = await userReviewRepository.findByPostTargetAndReviewer(
      'p-1',
      'u-2',
      'u-1',
    );
    expect(result).toEqual(mockReview);
  });

  it('should calculate summary for user reviews ignoring flagged', async () => {
    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        avgRating: '4.80',
        totalReviews: '5',
      }),
    };
    repository.createQueryBuilder.mockReturnValue(
      qb as unknown as SelectQueryBuilder<UserReviewEntity>,
    );

    const summary = await userReviewRepository.calculateSummary('u-2');
    expect(summary.avgRating).toBe(4.8);
    expect(summary.totalReviews).toBe(5);
  });
});
