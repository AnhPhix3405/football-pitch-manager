import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
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
      throw new NotFoundException('Không tìm thấy bài đăng.');
    }

    return this.postCommentRepository.findByPostId(postId);
  }

  async addComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<PostCommentEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post || post.deletedAt) {
      throw new NotFoundException('Không tìm thấy bài đăng.');
    }

    const comment = this.postCommentRepository.create({
      id: randomUUID(),
      postId,
      userId,
      content: content.trim(),
    });

    const saved = await this.postCommentRepository.save(comment);
    // Reload to get user relation if needed
    const comments = await this.postCommentRepository.findByPostId(postId);
    const reloaded = comments.find((c) => c.id === saved.id);
    return reloaded || saved;
  }
}
