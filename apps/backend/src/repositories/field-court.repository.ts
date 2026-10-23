import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldCourtEntity } from '~/entities/field-court.entity';

export interface FindCourtsFilter {
  type?: string;
  status?: string;
}

@Injectable()
export class FieldCourtRepository extends BaseRepository<FieldCourtEntity> {
  constructor(
    @InjectRepository(FieldCourtEntity)
    repository: Repository<FieldCourtEntity>,
  ) {
    super(repository);
  }

  async findByFieldId(
    fieldId: string,
    filter?: FindCourtsFilter,
  ): Promise<FieldCourtEntity[]> {
    const where: FindOptionsWhere<FieldCourtEntity> = { fieldId };
    if (filter?.type) {
      where.type = filter.type;
    }
    if (filter?.status) {
      where.status = filter.status;
    }

    return this.repository.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  async findByFieldAndName(
    fieldId: string,
    name: string,
  ): Promise<FieldCourtEntity | null> {
    return this.repository.findOne({
      where: { fieldId, name },
    });
  }

  async findByIdAndFieldId(
    id: string,
    fieldId: string,
  ): Promise<FieldCourtEntity | null> {
    return this.repository.findOne({
      where: { id, fieldId },
    });
  }
}
