/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { ApplicationException } from '~/common/exceptions/application.exception';
import { PostCommentEntity } from '~/entities/post-comment.entity';
import { PostEntity } from '~/entities/post.entity';
import { PostCommentRepository } from '~/repositories/post-comment.repository';
import { PostRepository } from '~/repositories/post.repository';
import { PostCommentService } from './post-comment.service';

describe('PostCommentService', () => {
  let service: PostCommentService;
  let postRepository: jest.Mocked<PostRepository>;
  let postCommentRepository: jest.Mocked<PostCommentRepository>;

  beforeEach(() => {
    postRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<PostRepository>;

    postCommentRepository = {
      findByPostId: jest.fn(),
      create: jest.fn((e) => e as PostCommentEntity),
      save: jest.fn((e) => Promise.resolve(e as PostCommentEntity)),
    } as unknown as jest.Mocked<PostCommentRepository>;

    service = new PostCommentService(postRepository, postCommentRepository);
  });

  describe('getComments', () => {
    it('returns list of comments if post exists', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        deletedAt: null,
      } as PostEntity);
      const comments: PostCommentEntity[] = [
        { id: 'c-1', content: 'Nice match' } as PostCommentEntity,
      ];
      postCommentRepository.findByPostId.mockResolvedValue(comments);

      const result = await service.getComments('p-1');
      expect(result).toEqual(comments);
    });

    it('throws POST_NOT_FOUND if post not found', async () => {
      postRepository.findById.mockResolvedValue(null);

      await expect(service.getComments('invalid')).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('addComment', () => {
    it('adds comment successfully to active post', async () => {
      postRepository.findById.mockResolvedValue({
        id: 'p-1',
        deletedAt: null,
      } as PostEntity);
      postCommentRepository.findByPostId.mockResolvedValue([]);

      const result = await service.addComment('p-1', 'u-1', 'Giao lưu nhé');
      expect(result.content).toBe('Giao lưu nhé');
      expect(postCommentRepository.save).toHaveBeenCalled();
    });

    it('rejects empty comment', async () => {
      await expect(service.addComment('p-1', 'u-1', '   ')).rejects.toThrow(
        ApplicationException,
      );
    });
  });
});
