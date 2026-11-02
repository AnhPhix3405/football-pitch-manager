jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { FieldRankingService } from './field-ranking.service';

describe('FieldRankingService', () => {
  let service: FieldRankingService;
  let mockFieldRatingSummaryRepo: {
    findTopRanked: jest.Mock;
  };

  beforeEach(async () => {
    mockFieldRatingSummaryRepo = {
      findTopRanked: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldRankingService,
        {
          provide: FieldRatingSummaryRepository,
          useValue: mockFieldRatingSummaryRepo,
        },
      ],
    }).compile();

    service = module.get<FieldRankingService>(FieldRankingService);
  });

  it('should return top ranked fields mapped cleanly', async () => {
    mockFieldRatingSummaryRepo.findTopRanked.mockResolvedValue([
      {
        fieldId: 'field-1',
        avgRating: '4.90',
        totalReviews: 20,
        bayesianScore: '4.780',
        field: {
          name: 'San Chanh Hung',
          address: '123 Pham Hung',
          district: 'Quan 8',
        },
      },
    ]);

    const result = await service.getTopRankedFields(5);

    expect(mockFieldRatingSummaryRepo.findTopRanked).toHaveBeenCalledWith({
      limit: 5,
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      fieldId: 'field-1',
      name: 'San Chanh Hung',
      address: '123 Pham Hung',
      district: 'Quan 8',
      avgRating: '4.90',
      totalReviews: 20,
      bayesianScore: '4.780',
    });
  });
});
