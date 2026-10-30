jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository, SelectQueryBuilder } from 'typeorm';
import { PostEntity } from '~/entities/post.entity';
import { PostRepository } from './post.repository';

describe('PostRepository', () => {
  let repository: jest.Mocked<Repository<PostEntity>>;
  let postRepository: PostRepository;

  beforeEach(() => {
    repository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<PostEntity>>;

    postRepository = new PostRepository(repository);
  });

  it('should find post detail by id excluding soft-deleted posts', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 'post-1', title: 'Test Post' }),
    };
    repository.createQueryBuilder.mockReturnValue(
      qb as unknown as SelectQueryBuilder<PostEntity>,
    );

    const result = await postRepository.findPostDetailById('post-1');
    expect(result).toEqual({ id: 'post-1', title: 'Test Post' });
    expect(qb.where).toHaveBeenCalledWith('post.id = :id', { id: 'post-1' });
    expect(qb.andWhere).toHaveBeenCalledWith('post.deletedAt IS NULL');
  });
});
