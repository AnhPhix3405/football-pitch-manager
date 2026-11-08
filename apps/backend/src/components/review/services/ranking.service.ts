import { Injectable } from '@nestjs/common';
import { FieldImageRepository } from '~/repositories/field-image.repository';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';
import { UserRatingSummaryRepository } from '~/repositories/user-rating-summary.repository';

function getDistrictFromLocation(
  lat?: string | null,
  lng?: string | null,
): string {
  if (!lat || !lng) {
    return 'Chưa cập nhật';
  }
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) {
    return 'Chưa cập nhật';
  }
  if (latNum >= 20.7 && latNum <= 21.4 && lngNum >= 105.5 && lngNum <= 106.1) {
    return 'Hà Nội';
  }
  if (latNum >= 10.3 && latNum <= 11.2 && lngNum >= 106.3 && lngNum <= 107.1) {
    return 'TP. Hồ Chí Minh';
  }
  if (latNum >= 15.9 && latNum <= 16.2 && lngNum >= 108.0 && lngNum <= 108.4) {
    return 'Đà Nẵng';
  }
  return 'Việt Nam';
}

@Injectable()
export class RankingService {
  constructor(
    private readonly fieldRatingSummaryRepository: FieldRatingSummaryRepository,
    private readonly userRatingSummaryRepository: UserRatingSummaryRepository,
    private readonly fieldImageRepository: FieldImageRepository,
  ) {}

  async getFieldRankings(limit = 20) {
    const list = await this.fieldRatingSummaryRepository.findTopRanked({
      limit,
    });

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
      const district = getDistrictFromLocation(item.user?.lat, item.user?.lng);
      return {
        rank: index + 1,
        userId: item.userId,
        name: profile?.fullName || item.user?.email?.split('@')[0] || 'Cầu thủ',
        avatarUrl: profile?.avatarUrl ?? null,
        skillLevel: profile?.skillLevel ?? 'Chưa cập nhật',
        district,
        avgRating: parseFloat(item.avgRating),
        totalReviews: item.totalReviews,
        sportsmanshipScore: parseFloat(item.sportsmanshipScore),
      };
    });
  }
}
