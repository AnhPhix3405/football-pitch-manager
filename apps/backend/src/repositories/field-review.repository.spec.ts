jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { FieldReviewEntity } from '~/entities/field-review.entity';
import { FieldReviewRepository } from './field-review.repository';

describe('FieldReviewRepository', () => {
  let repository: {
    findOne: jest.Mock;
    findAndCount: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let reviewRepository: FieldReviewRepository;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    reviewRepository = new FieldReviewRepository(
      repository as unknown as Repository<FieldReviewEntity>,
    );
  });

  it('should find review by booking and reviewer', async () => {
    const mockReview = {
      id: 'r-1',
      bookingId: 'b-1',
      reviewerId: 'u-1',
    } as FieldReviewEntity;
    repository.findOne.mockResolvedValue(mockReview);

    const result = await reviewRepository.findByBookingAndReviewer(
      'b-1',
      'u-1',
    );
    expect(result).toEqual(mockReview);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { bookingId: 'b-1', reviewerId: 'u-1' },
      relations: { reviewer: true, booking: true },
    });
  });

  it('should calculate summary ignoring flagged reviews', async () => {
    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        avgRating: '4.50',
        totalReviews: '10',
      }),
    };
    repository.createQueryBuilder.mockReturnValue(qb);

    const summary = await reviewRepository.calculateSummary('f-1');
    expect(summary.avgRating).toBe(4.5);
    expect(summary.totalReviews).toBe(10);
  });
});
