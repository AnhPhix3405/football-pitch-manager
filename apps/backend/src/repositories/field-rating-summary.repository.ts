import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldRatingSummaryEntity } from '~/entities/field-rating-summary.entity';

@Injectable()
export class FieldRatingSummaryRepository {
  constructor(
    @InjectRepository(FieldRatingSummaryEntity)
    private readonly repository: Repository<FieldRatingSummaryEntity>,
  ) {}

  findByFieldId(fieldId: string): Promise<FieldRatingSummaryEntity | null> {
    return this.repository.findOne({
      where: { fieldId },
    });
  }

  async upsertSummary(
    fieldId: string,
    avgRating: number,
    totalReviews: number,
    bayesianScore: number,
  ): Promise<FieldRatingSummaryEntity> {
    let existing = await this.findByFieldId(fieldId);
    if (!existing) {
      existing = this.repository.create({
        fieldId,
        avgRating: avgRating.toFixed(2),
        totalReviews,
        bayesianScore: bayesianScore.toFixed(3),
      });
    } else {
      existing.avgRating = avgRating.toFixed(2);
      existing.totalReviews = totalReviews;
      existing.bayesianScore = bayesianScore.toFixed(3);
    }

    return this.repository.save(existing);
  }

  async findTopRanked(limit = 20): Promise<FieldRatingSummaryEntity[]> {
    return this.repository.find({
      relations: {
        field: true,
      },
      order: {
        bayesianScore: 'DESC',
        totalReviews: 'DESC',
      },
      take: limit,
    });
  }

  async getOverallFieldAverage(): Promise<{ avg: number; count: number }> {
    const res = await this.repository
      .createQueryBuilder('summary')
      .select('AVG(summary.avg_rating)', 'overallAvg')
      .addSelect('COUNT(summary.field_id)', 'fieldCount')
      .where('summary.total_reviews > 0')
      .getRawOne<{ overallAvg: string | null; fieldCount: string }>();

    return {
      avg: parseFloat(res?.overallAvg || '4.0'),
      count: parseInt(res?.fieldCount || '0', 10),
    };
  }
}
