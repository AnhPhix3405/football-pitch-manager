import { Injectable } from '@nestjs/common';
import { FieldRatingSummaryRepository } from '~/repositories/field-rating-summary.repository';

export interface RankedFieldItem {
  fieldId: string;
  name: string;
  address: string;
  district: string | null;
  avgRating: string;
  totalReviews: number;
  bayesianScore: string;
}

@Injectable()
export class FieldRankingService {
  constructor(
    private readonly fieldRatingSummaryRepository: FieldRatingSummaryRepository,
  ) {}

  async getTopRankedFields(limit = 10): Promise<RankedFieldItem[]> {
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));

    const summaries = await this.fieldRatingSummaryRepository.findTopRanked({
      limit: safeLimit,
    });

    return summaries.map((s) => ({
      fieldId: s.fieldId,
      name: s.field.name,
      address: s.field.address,
      district: s.field.district,
      avgRating: s.avgRating,
      totalReviews: s.totalReviews,
      bayesianScore: s.bayesianScore,
    }));
  }
}
