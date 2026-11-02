import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { PostCommentEntity } from '~/entities/post-comment.entity';
import { UserProfileEntity } from '~/entities/user-profile.entity';

@Injectable()
export class PostCommentRepository extends BaseRepository<PostCommentEntity> {
  constructor(
    @InjectRepository(PostCommentEntity)
    repository: Repository<PostCommentEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly profileRepository?: Repository<UserProfileEntity>,
  ) {
    super(repository);
  }

  async findByPostId(postId: string): Promise<PostCommentEntity[]> {
    const comments = await this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    await this.attachUserProfiles(comments);
    return comments;
  }

  private async attachUserProfiles(
    comments: PostCommentEntity[],
  ): Promise<void> {
    if (!this.profileRepository || !comments || comments.length === 0) return;
    const userIds = [...new Set(comments.map((c) => c.userId).filter(Boolean))];
    if (userIds.length === 0) return;

    try {
      const profiles = await this.profileRepository.find({
        where: { userId: In(userIds) },
      });
      const profileMap = new Map(profiles.map((p) => [p.userId, p]));

      for (const comment of comments) {
        if (comment.user) {
          const profile = profileMap.get(comment.userId);
          Object.assign(comment.user, {
            fullName: profile?.fullName || null,
            avatarUrl: profile?.avatarUrl || null,
          });
        }
      }
    } catch {
      // Graceful fallback
    }
  }
}
