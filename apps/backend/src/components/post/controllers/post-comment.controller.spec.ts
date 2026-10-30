/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { PostCommentEntity } from '~/entities/post-comment.entity';
import { PostCommentService } from '../services/post-comment.service';
import { PostCommentController } from './post-comment.controller';

describe('PostCommentController', () => {
  let controller: PostCommentController;
  let service: jest.Mocked<PostCommentService>;

  beforeEach(() => {
    service = {
      getComments: jest.fn(),
      addComment: jest.fn(),
    } as unknown as jest.Mocked<PostCommentService>;

    controller = new PostCommentController(service);
  });

  it('delegates getComments to service', async () => {
    const comments = [{ id: 'c-1', content: 'Test' }] as PostCommentEntity[];
    service.getComments.mockResolvedValue(comments);

    const result = await controller.getComments('p-1');
    expect(result).toEqual(comments);
    expect(service.getComments).toHaveBeenCalledWith('p-1');
  });

  it('delegates addComment to service', async () => {
    const comment = { id: 'c-1', content: 'Hello' } as PostCommentEntity;
    service.addComment.mockResolvedValue(comment);

    const result = await controller.addComment('p-1', 'user-1', {
      content: 'Hello',
    });
    expect(result).toEqual(comment);
    expect(service.addComment).toHaveBeenCalledWith('p-1', 'user-1', 'Hello');
  });
});
