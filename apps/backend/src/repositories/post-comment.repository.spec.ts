jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository, SelectQueryBuilder } from 'typeorm';
import { PostCommentEntity } from '~/entities/post-comment.entity';
import { PostCommentRepository } from './post-comment.repository';

describe('PostCommentRepository', () => {
  let repository: jest.Mocked<Repository<PostCommentEntity>>;
  let commentRepository: PostCommentRepository;

  beforeEach(() => {
    repository = {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<PostCommentEntity>>;

    commentRepository = new PostCommentRepository(repository);
  });

  it('should find comments by postId ordered by createdAt ASC', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([{ id: 'c-1', content: 'Great match' }]),
    };
    repository.createQueryBuilder.mockReturnValue(
      qb as unknown as SelectQueryBuilder<PostCommentEntity>,
    );

    const result = await commentRepository.findByPostId('post-1');
    expect(result).toHaveLength(1);
    expect(qb.orderBy).toHaveBeenCalledWith('comment.createdAt', 'ASC');
  });
});
