import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { PostCommentEntity } from '~/entities/post-comment.entity';

@Injectable()
export class PostCommentRepository extends BaseRepository<PostCommentEntity> {
  constructor(
    @InjectRepository(PostCommentEntity)
    repository: Repository<PostCommentEntity>,
  ) {
    super(repository);
  }

  async findByPostId(postId: string): Promise<PostCommentEntity[]> {
    return this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();
  }
}
