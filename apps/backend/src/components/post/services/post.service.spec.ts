/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import dayjs from 'dayjs';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { PostEntity } from '~/entities/post.entity';
import { PostRepository } from '~/repositories/post.repository';
import { POST_STATUS } from '../constants/post.constant';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let postRepository: jest.Mocked<PostRepository>;

  beforeEach(() => {
    postRepository = {
      findPublicPosts: jest.fn(),
      findMyPosts: jest.fn(),
      findPostDetailById: jest.fn(),
      findById: jest.fn(),
      create: jest.fn((entity) => entity as PostEntity),
      save: jest.fn((entity) => Promise.resolve(entity as PostEntity)),
    } as unknown as jest.Mocked<PostRepository>;

    service = new PostService(postRepository);
  });

  describe('createPost', () => {
    it('creates post successfully with valid date and time', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      const dto = {
        title: 'Giao lưu bóng đá sân 7',
        playDate: tomorrow,
        startTime: '18:00',
        endTime: '19:30',
        maxPlayers: 14,
      };

      const result = await service.createPost('user-1', dto);
      expect(result.title).toBe(dto.title);
      expect(result.userId).toBe('user-1');
      expect(result.status).toBe(POST_STATUS.OPEN);
      expect(result.currentPlayers).toBe(0);
      expect(postRepository.save).toHaveBeenCalled();
    });

    it('rejects post creation if playDate is in the past', async () => {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const dto = {
        title: 'Past match',
        playDate: yesterday,
        startTime: '18:00',
        endTime: '19:30',
        maxPlayers: 14,
      };

      await expect(service.createPost('user-1', dto)).rejects.toThrow(
        ApplicationException,
      );
    });

    it('rejects post creation if startTime >= endTime', async () => {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      const dto = {
        title: 'Invalid time match',
        playDate: tomorrow,
        startTime: '19:00',
        endTime: '18:00',
        maxPlayers: 14,
      };

      await expect(service.createPost('user-1', dto)).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('getPostDetail', () => {
    it('returns post detail if found and not deleted', async () => {
      const post = {
        id: 'post-1',
        title: 'Match',
        deletedAt: null,
      } as PostEntity;
      postRepository.findPostDetailById.mockResolvedValue(post);

      const result = await service.getPostDetail('post-1');
      expect(result).toEqual(post);
    });

    it('throws POST_NOT_FOUND if post not found or soft deleted', async () => {
      postRepository.findPostDetailById.mockResolvedValue(null);

      await expect(service.getPostDetail('post-not-exist')).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('updatePost', () => {
    it('updates post if user is the author', async () => {
      const post = {
        id: 'post-1',
        userId: 'user-1',
        title: 'Old title',
        deletedAt: null,
      } as PostEntity;
      postRepository.findById.mockResolvedValue(post);

      const result = await service.updatePost('user-1', 'post-1', {
        title: 'New title',
      });
      expect(result.title).toBe('New title');
      expect(postRepository.save).toHaveBeenCalled();
    });

    it('rejects update if user is not author', async () => {
      const post = {
        id: 'post-1',
        userId: 'author-1',
        title: 'Title',
        deletedAt: null,
      } as PostEntity;
      postRepository.findById.mockResolvedValue(post);

      await expect(
        service.updatePost('intruder', 'post-1', { title: 'Hacked' }),
      ).rejects.toThrow(ApplicationException);
    });
  });

  describe('deletePost', () => {
    it('soft deletes post by setting deletedAt and status cancelled', async () => {
      const post = {
        id: 'post-1',
        userId: 'user-1',
        status: POST_STATUS.OPEN,
        deletedAt: null,
      } as PostEntity;
      postRepository.findById.mockResolvedValue(post);

      await service.deletePost('user-1', 'post-1');
      expect(post.deletedAt).toBeInstanceOf(Date);
      expect(post.status).toBe(POST_STATUS.CANCELLED);
      expect(postRepository.save).toHaveBeenCalledWith(post);
    });
  });
});
