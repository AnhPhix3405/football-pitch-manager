import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserProfileEntity } from '~/entities/user-profile.entity';
import { UserRatingSummaryEntity } from '~/entities/user-rating-summary.entity';

@Injectable()
export class UserRatingSummaryRepository {
  constructor(
    @InjectRepository(UserRatingSummaryEntity)
    private readonly repository: Repository<UserRatingSummaryEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly profileRepository: Repository<UserProfileEntity>,
  ) {}

  findByUserId(userId: string): Promise<UserRatingSummaryEntity | null> {
    return this.repository.findOne({
      where: { userId },
    });
  }

  async upsertSummary(
    userId: string,
    avgRating: number,
    totalReviews: number,
    sportsmanshipScore: number,
  ): Promise<UserRatingSummaryEntity> {
    let existing = await this.findByUserId(userId);
    if (!existing) {
      existing = this.repository.create({
        userId,
        avgRating: avgRating.toFixed(2),
        totalReviews,
        sportsmanshipScore: sportsmanshipScore.toFixed(2),
      });
    } else {
      existing.avgRating = avgRating.toFixed(2);
      existing.totalReviews = totalReviews;
      existing.sportsmanshipScore = sportsmanshipScore.toFixed(2);
    }

    return this.repository.save(existing);
  }

  async findTopRanked(
    limit = 20,
  ): Promise<
    Array<UserRatingSummaryEntity & { profile?: UserProfileEntity | null }>
  > {
    const list = await this.repository.find({
      relations: {
        user: true,
      },
      order: {
        sportsmanshipScore: 'DESC',
        totalReviews: 'DESC',
      },
      take: limit,
    });

    const userIds = list.map((i) => i.userId).filter(Boolean);
    let profilesMap = new Map<string, UserProfileEntity>();

    if (userIds.length > 0) {
      const profiles = await this.profileRepository.find({
        where: { userId: In(userIds) },
      });
      profilesMap = new Map(profiles.map((p) => [p.userId, p]));
    }

    return list.map((item) => ({
      ...item,
      profile: profilesMap.get(item.userId) || null,
    }));
  }
}
