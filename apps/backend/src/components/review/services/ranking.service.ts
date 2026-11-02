import { Injectable } from '@nestjs/common';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';

@Injectable()
export class RankingService {
  constructor(
    private readonly fieldRatingSummaryRepository: FieldRatingSummaryRepository,
    private readonly userRatingSummaryRepository: UserRatingSummaryRepository,
    private readonly fieldImageRepository: FieldImageRepository,
  ) {}

  async getFieldRankings(limit = 20) {
    const list = await this.fieldRatingSummaryRepository.findTopRanked(limit);

    const results = await Promise.all(
      list.map(async (item, index) => {
        const thumbnail = await this.fieldImageRepository.findThumbnail(
          item.fieldId,
        );
        return {
          rank: index + 1,
          fieldId: item.fieldId,
          name: item.field?.name ?? 'Sân bóng',
          address: item.field?.address ?? '',
          district: item.field?.district ?? '',
          avgRating: parseFloat(item.avgRating),
          totalReviews: item.totalReviews,
          bayesianScore: parseFloat(item.bayesianScore),
          thumbnailUrl: thumbnail?.url ?? null,
        };
      }),
    );

    return results;
  }

  async getPlayerRankings(limit = 20) {
    const list = await this.userRatingSummaryRepository.findTopRanked(limit);

    return list.map((item, index) => {
      const profile = item.profile;
      return {
        rank: index + 1,
        userId: item.userId,
        name: profile?.fullName || item.user?.email?.split('@')[0] || 'Cầu thủ',
        avatarUrl: profile?.avatarUrl ?? null,
        skillLevel: profile?.skillLevel ?? 'Chưa cập nhật',
        avgRating: parseFloat(item.avgRating),
        totalReviews: item.totalReviews,
        sportsmanshipScore: parseFloat(item.sportsmanshipScore),
      };
    });
  }
}
