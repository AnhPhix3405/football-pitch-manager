jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => undefined,
  CronExpression: {
    EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from '~/repositories/post.repository';
import { PostCleanupService } from './post-cleanup.service';

describe('PostCleanupService', () => {
  let service: PostCleanupService;
  let postRepository: {
    closeExpiredPostsToday: jest.Mock;
    softDeleteExpiredPosts: jest.Mock;
    hardDeleteExpiredPosts: jest.Mock;
  };

  beforeEach(async () => {
    postRepository = {
      closeExpiredPostsToday: jest.fn().mockResolvedValue(3),
      softDeleteExpiredPosts: jest.fn().mockResolvedValue(5),
      hardDeleteExpiredPosts: jest.fn().mockResolvedValue(2),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostCleanupService,
        {
          provide: PostRepository,
          useValue: postRepository,
        },
      ],
    }).compile();

    service = module.get<PostCleanupService>(PostCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('closeExpiredPostsToday', () => {
    it('should call repository to close expired posts for today', async () => {
      const result = await service.closeExpiredPostsToday();

      expect(postRepository.closeExpiredPostsToday).toHaveBeenCalledTimes(1);
      expect(result).toBe(3);
    });
  });

  describe('handleCloseExpiredPostsToday', () => {
    it('should execute closeExpiredPostsToday without throwing error', async () => {
      await expect(
        service.handleCloseExpiredPostsToday(),
      ).resolves.not.toThrow();
      expect(postRepository.closeExpiredPostsToday).toHaveBeenCalledTimes(1);
    });

    it('should catch error gracefully if repository fails', async () => {
      postRepository.closeExpiredPostsToday.mockRejectedValueOnce(
        new Error('DB error'),
      );

      await expect(
        service.handleCloseExpiredPostsToday(),
      ).resolves.not.toThrow();
    });
  });

  describe('midnightCleanup', () => {
    it('should soft delete expired posts and hard delete posts older than 7 days', async () => {
      const result = await service.midnightCleanup();

      expect(postRepository.softDeleteExpiredPosts).toHaveBeenCalledTimes(1);
      expect(postRepository.hardDeleteExpiredPosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        softDeletedCount: 5,
        hardDeletedCount: 2,
      });
    });
  });

  describe('handleMidnightCleanup', () => {
    it('should call midnightCleanup without throwing errors', async () => {
      await expect(service.handleMidnightCleanup()).resolves.not.toThrow();
      expect(postRepository.softDeleteExpiredPosts).toHaveBeenCalledTimes(1);
      expect(postRepository.hardDeleteExpiredPosts).toHaveBeenCalledTimes(1);
    });

    it('should catch and log errors gracefully if repository fails', async () => {
      postRepository.softDeleteExpiredPosts.mockRejectedValueOnce(
        new Error('DB error'),
      );

      await expect(service.handleMidnightCleanup()).resolves.not.toThrow();
    });
  });
});
