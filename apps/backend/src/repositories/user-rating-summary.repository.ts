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

  async findByUserId(userId: string): Promise<UserRatingSummaryEntity | null> {
    return this.repository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  async save(
    summary: UserRatingSummaryEntity,
  ): Promise<UserRatingSummaryEntity> {
    return this.repository.save(summary);
  }

  create(data: Partial<UserRatingSummaryEntity>): UserRatingSummaryEntity {
    return this.repository.create(data);
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
        avgRating: 'DESC',
        totalReviews: 'DESC',
        updatedAt: 'ASC',
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
