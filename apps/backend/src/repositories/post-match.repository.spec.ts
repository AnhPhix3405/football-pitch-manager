/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { PostMatchEntity } from '~/entities/post-match.entity';
import { PostMatchRepository } from './post-match.repository';

describe('PostMatchRepository', () => {
  let repository: jest.Mocked<Repository<PostMatchEntity>>;
  let matchRepository: PostMatchRepository;

  beforeEach(() => {
    repository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<PostMatchEntity>>;

    matchRepository = new PostMatchRepository(repository);
  });

  it('should find match by postId and applicantId', async () => {
    const mockMatch = {
      id: 'm-1',
      postId: 'p-1',
      applicantId: 'u-1',
    } as unknown as PostMatchEntity;
    repository.findOne.mockResolvedValue(mockMatch);

    const result = await matchRepository.findByPostAndApplicant('p-1', 'u-1');
    expect(result).toEqual(mockMatch);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { postId: 'p-1', applicantId: 'u-1' },
      relations: { applicant: true },
    });
  });
});
