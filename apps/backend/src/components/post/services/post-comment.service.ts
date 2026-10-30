import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { PostCommentEntity } from '~/entities/post-comment.entity';
import { PostCommentRepository } from '~/repositories/post-comment.repository';
import { PostRepository } from '~/repositories/post.repository';

@Injectable()
export class PostCommentService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postCommentRepository: PostCommentRepository,
  ) {}

  async getComments(postId: string): Promise<PostCommentEntity[]> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return this.postCommentRepository.findByPostId(postId);
  }

  async addComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<PostCommentEntity> {
    if (!content || !content.trim()) {
      throw new ApplicationException({
        code: 'COMMENT_EMPTY',
        messageKey: 'error.commentEmpty',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new ApplicationException({
        code: 'POST_NOT_FOUND',
        messageKey: 'error.postNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const comment = this.postCommentRepository.create({
      id: randomUUID(),
      postId,
      userId,
      content: content.trim(),
    });

    const saved = await this.postCommentRepository.save(comment);
    const comments = await this.postCommentRepository.findByPostId(postId);
    const reloaded = comments.find((c) => c.id === saved.id);
    return reloaded || saved;
  }
}
