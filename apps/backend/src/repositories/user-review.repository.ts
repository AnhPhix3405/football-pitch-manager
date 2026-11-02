import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserReviewEntity } from '~/entities/user-review.entity';

@Injectable()
export class UserReviewRepository extends BaseRepository<UserReviewEntity> {
  constructor(
    @InjectRepository(UserReviewEntity)
    repository: Repository<UserReviewEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly profileRepository: Repository<UserProfileEntity>,
  ) {
    super(repository);
  }

  findByPostTargetAndReviewer(
    postId: string,
    targetUserId: string,
    reviewerId: string,
  ): Promise<UserReviewEntity | null> {
    return this.repository.findOne({
      where: { postId, targetUserId, reviewerId },
    });
  }

  async findPageByTargetUserId(
    targetUserId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    items: Array<
      UserReviewEntity & { reviewerProfile?: UserProfileEntity | null }
    >;
    total: number;
  }> {
    const [items, total] = await this.repository.findAndCount({
      where: { targetUserId, isFlagged: false },
      relations: {
        reviewer: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const reviewerIds = [
      ...new Set(items.map((i) => i.reviewerId).filter(Boolean)),
    ];
    let profilesMap = new Map<string, UserProfileEntity>();

    if (reviewerIds.length > 0) {
      const profiles = await this.profileRepository.find({
        where: { userId: In(reviewerIds) },
      });
      profilesMap = new Map(profiles.map((p) => [p.userId, p]));
    }

    const itemsWithProfile = items.map((item) => ({
      ...item,
      reviewerProfile: profilesMap.get(item.reviewerId) || null,
    }));

    return { items: itemsWithProfile, total };
  }

  async getRatingStatsByTargetUserId(targetUserId: string): Promise<{
    count: number;
    avgRating: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'count')
      .addSelect('AVG(review.rating)', 'avg')
      .where('review.target_user_id = :targetUserId', { targetUserId })
      .andWhere('review.is_flagged = false')
      .getRawOne<{ count: string; avg: string | null }>();

    const count = parseInt(result?.count || '0', 10);
    const avgRating = parseFloat(result?.avg || '0');

    return { count, avgRating };
  }
}
