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

  async findByFieldId(
    fieldId: string,
  ): Promise<FieldRatingSummaryEntity | null> {
    return this.repository.findOne({
      where: { fieldId },
      relations: { field: true },
    });
  }

  async save(
    summary: FieldRatingSummaryEntity,
  ): Promise<FieldRatingSummaryEntity> {
    return this.repository.save(summary);
  }

  create(data: Partial<FieldRatingSummaryEntity>): FieldRatingSummaryEntity {
    return this.repository.create(data);
  }

  async findTopRanked(
    options: { limit?: number; districtId?: string } = {},
  ): Promise<FieldRatingSummaryEntity[]> {
    const limit = Math.max(1, Math.min(50, Number(options.limit) || 10));

    const qb = this.repository
      .createQueryBuilder('summary')
      .innerJoinAndSelect('summary.field', 'field')
      .where('field.status = :status', { status: 'approved' });

    if (options.districtId) {
      qb.andWhere('field.district = :districtId', {
        districtId: options.districtId,
      });
    }

    qb.orderBy('summary.bayesianScore', 'DESC')
      .addOrderBy('summary.totalReviews', 'DESC')
      .take(limit);

    return qb.getMany();
  }
}
