import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { PostMatchEntity } from '~/entities/post-match.entity';

@Injectable()
export class PostMatchRepository extends BaseRepository<PostMatchEntity> {
  constructor(
    @InjectRepository(PostMatchEntity) repository: Repository<PostMatchEntity>,
  ) {
    super(repository);
  }

  async findByPostId(postId: string): Promise<PostMatchEntity[]> {
    return this.repository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.applicant', 'applicant')
      .where('match.postId = :postId', { postId })
      .orderBy('match.createdAt', 'DESC')
      .getMany();
  }

  async findByPostAndApplicant(
    postId: string,
    applicantId: string,
  ): Promise<PostMatchEntity | null> {
    return this.repository.findOne({
      where: { postId, applicantId },
      relations: { applicant: true },
    });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.update(id, { status });
  }
}
