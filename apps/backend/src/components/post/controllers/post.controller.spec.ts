/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { PostEntity } from '~/entities/post.entity';
import { PostService } from '../services/post.service';
import { PostController } from './post.controller';

describe('PostController', () => {
  let controller: PostController;
  let service: jest.Mocked<PostService>;

  beforeEach(() => {
    service = {
      getPublicPosts: jest.fn(),
      getMyPosts: jest.fn(),
      getPostDetail: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    } as unknown as jest.Mocked<PostService>;

    controller = new PostController(service);
  });

  it('delegates getPublicPosts to service', async () => {
    service.getPublicPosts.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    const result = await controller.getPublicPosts({ page: 1, limit: 10 });
    expect(result.total).toBe(0);
    expect(service.getPublicPosts).toHaveBeenCalled();
  });

  it('delegates createPost to service', async () => {
    const post = { id: 'p-1', title: 'Post 1' } as PostEntity;
    service.createPost.mockResolvedValue(post);

    const dto = {
      title: 'Post 1',
      playDate: '2026-10-31',
      startTime: '18:00',
      maxPlayers: 14,
    };
    const result = await controller.createPost('user-1', dto);
    expect(result).toEqual(post);
    expect(service.createPost).toHaveBeenCalledWith('user-1', dto);
  });

  it('delegates deletePost to service', async () => {
    service.deletePost.mockResolvedValue();
    await controller.deletePost('user-1', 'p-1');
    expect(service.deletePost).toHaveBeenCalledWith('user-1', 'p-1');
  });
});
