jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { UserReviewEntity } from '~/entities/user-review.entity';
import { PostMatchRepository } from '~/repositories/post-match.repository';
import { PostRepository } from '~/repositories/post.repository';
import { UserReviewRepository } from '~/repositories/user-review.repository';
import { RatingSummaryService } from './rating-summary.service';
import { UserReviewService } from './user-review.service';

describe('UserReviewService', () => {
  let service: UserReviewService;
  let mockUserReviewRepo: {
    findByPostTargetAndReviewer: jest.Mock;
    findByTargetUserId: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockPostRepo: {
    findById: jest.Mock;
  };
  let mockPostMatchRepo: {
    findByPostId: jest.Mock;
  };
  let mockRatingSummaryService: {
    recalculateUserSummary: jest.Mock;
  };

  beforeEach(async () => {
    mockUserReviewRepo = {
      findByPostTargetAndReviewer: jest.fn(),
      findByTargetUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockPostRepo = {
      findById: jest.fn(),
    };
    mockPostMatchRepo = {
      findByPostId: jest.fn(),
    };
    mockRatingSummaryService = {
      recalculateUserSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserReviewService,
        {
          provide: UserReviewRepository,
          useValue: mockUserReviewRepo,
        },
        {
          provide: PostRepository,
          useValue: mockPostRepo,
        },
        {
          provide: PostMatchRepository,
          useValue: mockPostMatchRepo,
        },
        {
          provide: RatingSummaryService,
          useValue: mockRatingSummaryService,
        },
      ],
    }).compile();

    service = module.get<UserReviewService>(UserReviewService);
  });

  describe('createReview', () => {
    const reviewerId = 'user-1';
    const targetUserId = 'user-2';
    const postId = 'post-1';
    const dto = {
      targetUserId,
      postId,
      rating: 5,
      comment: 'Fair play player',
    };

    it('should throw BadRequestException on self-review', async () => {
      await expect(
        service.createReview(reviewerId, {
          ...dto,
          targetUserId: reviewerId,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPostRepo.findById.mockResolvedValue(null);

      await expect(service.createReview(reviewerId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if players were not in the same match', async () => {
      mockPostRepo.findById.mockResolvedValue({
        id: postId,
        userId: reviewerId,
      });

      // Target user is not accepted
      mockPostMatchRepo.findByPostId.mockResolvedValue([
        { applicantId: 'other-user', status: 'accepted' },
        { applicantId: targetUserId, status: 'pending' },
      ] as PostMatchEntity[]);

      await expect(service.createReview(reviewerId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if review already submitted', async () => {
      mockPostRepo.findById.mockResolvedValue({
        id: postId,
        userId: reviewerId,
      });

      mockPostMatchRepo.findByPostId.mockResolvedValue([
        { applicantId: targetUserId, status: 'accepted' },
      ] as PostMatchEntity[]);

      mockUserReviewRepo.findByPostTargetAndReviewer.mockResolvedValue({
        id: 'rev-1',
      });

      await expect(service.createReview(reviewerId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should save user review and update user summary on success', async () => {
      mockPostRepo.findById.mockResolvedValue({
        id: postId,
        userId: 'post-owner',
      });

      // Both reviewer and target are accepted applicants
      mockPostMatchRepo.findByPostId.mockResolvedValue([
        { applicantId: reviewerId, status: 'accepted' },
        { applicantId: targetUserId, status: 'accepted' },
      ] as PostMatchEntity[]);

      mockUserReviewRepo.findByPostTargetAndReviewer.mockResolvedValue(null);

      const created = {
        id: 'rev-user-1',
        postId,
        targetUserId,
        reviewerId,
        rating: 5,
        comment: dto.comment,
        isFlagged: false,
      };

      mockUserReviewRepo.create.mockReturnValue(created);
      mockUserReviewRepo.save.mockResolvedValue(created);
      mockRatingSummaryService.recalculateUserSummary.mockResolvedValue({});

      const result = await service.createReview(reviewerId, dto);

      expect(result).toEqual(created);
      expect(mockUserReviewRepo.create).toHaveBeenCalled();
      expect(mockUserReviewRepo.save).toHaveBeenCalled();
      expect(
        mockRatingSummaryService.recalculateUserSummary,
      ).toHaveBeenCalledWith(targetUserId);
    });
  });

  describe('getReviewsByUser', () => {
    it('should return paginated user reviews', async () => {
      const reviews = [{ id: 'rev-1', rating: 4 }] as UserReviewEntity[];
      mockUserReviewRepo.findByTargetUserId.mockResolvedValue({
        items: reviews,
        total: 1,
      });

      const result = await service.getReviewsByUser('target-user', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(reviews);
      expect(result.total).toBe(1);
    });
  });

  describe('getReviewById', () => {
    it('should throw NotFoundException if review not found', async () => {
      mockUserReviewRepo.findById.mockResolvedValue(null);

      await expect(service.getReviewById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return review when found', async () => {
      const review = { id: 'rev-1' } as UserReviewEntity;
      mockUserReviewRepo.findById.mockResolvedValue(review);

      const result = await service.getReviewById('rev-1');
      expect(result).toEqual(review);
    });
  });
});
