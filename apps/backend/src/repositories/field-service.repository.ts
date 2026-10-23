import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldServiceEntity } from '~/entities/field-service.entity';

@Injectable()
export class FieldServiceRepository extends BaseRepository<FieldServiceEntity> {
  constructor(
    @InjectRepository(FieldServiceEntity)
    repository: Repository<FieldServiceEntity>,
  ) {
    super(repository);
  }

  async findByFieldId(
    fieldId: string,
    isActive?: boolean,
  ): Promise<FieldServiceEntity[]> {
    const where: FindOptionsWhere<FieldServiceEntity> = { fieldId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.repository.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  async findByFieldAndName(
    fieldId: string,
    name: string,
  ): Promise<FieldServiceEntity | null> {
    return this.repository.findOne({
      where: { fieldId, name },
    });
  }

  async findByIdAndFieldId(
    id: string,
    fieldId: string,
  ): Promise<FieldServiceEntity | null> {
    return this.repository.findOne({
      where: { id, fieldId },
    });
  }
}
