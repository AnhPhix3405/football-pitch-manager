import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldPricingEntity } from '~/entities/field-pricing.entity';

export interface FieldPricingFilter {
  courtType?: string;
  dayType?: string;
}

@Injectable()
export class FieldPricingRepository extends BaseRepository<FieldPricingEntity> {
  constructor(
    @InjectRepository(FieldPricingEntity)
    repository: Repository<FieldPricingEntity>,
  ) {
    super(repository);
  }

  async findByField(
    fieldId: string,
    filter?: FieldPricingFilter,
  ): Promise<FieldPricingEntity[]> {
    const qb = this.repository
      .createQueryBuilder('pricing')
      .where('pricing.fieldId = :fieldId', { fieldId });

    if (filter?.courtType) {
      qb.andWhere('pricing.courtType = :courtType', {
        courtType: filter.courtType,
      });
    }
    if (filter?.dayType) {
      qb.andWhere('pricing.dayType = :dayType', { dayType: filter.dayType });
    }

    return qb
      .orderBy('pricing.courtType', 'ASC')
      .addOrderBy('pricing.dayType', 'ASC')
      .addOrderBy('pricing.startTime', 'ASC')
      .getMany();
  }

  async findByIdAndFieldId(
    id: string,
    fieldId: string,
  ): Promise<FieldPricingEntity | null> {
    return this.repository.findOne({
      where: { id, fieldId },
    });
  }

  async findOverlappingSlots(
    fieldId: string,
    courtType: string,
    dayType: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<FieldPricingEntity[]> {
    const qb = this.repository
      .createQueryBuilder('pricing')
      .where('pricing.fieldId = :fieldId', { fieldId })
      .andWhere('pricing.courtType = :courtType', { courtType })
      .andWhere('pricing.dayType = :dayType', { dayType })
      .andWhere('pricing.startTime < :endTime', { endTime })
      .andWhere('pricing.endTime > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('pricing.id != :excludeId', { excludeId });
    }

    return qb.getMany();
  }
}
