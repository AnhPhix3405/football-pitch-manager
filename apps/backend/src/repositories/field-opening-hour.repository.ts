import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';

export interface WeeklyOpeningHourInput {
  dayOfWeek: number;
  openTime?: string | null;
  closeTime?: string | null;
  isClosed: boolean;
}

@Injectable()
export class FieldOpeningHourRepository extends BaseRepository<FieldOpeningHourEntity> {
  constructor(
    @InjectRepository(FieldOpeningHourEntity)
    repository: Repository<FieldOpeningHourEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  async findByFieldId(fieldId: string): Promise<FieldOpeningHourEntity[]> {
    return this.repository.find({
      where: { fieldId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async findByFieldAndDay(
    fieldId: string,
    dayOfWeek: number,
  ): Promise<FieldOpeningHourEntity | null> {
    return this.repository.findOne({
      where: { fieldId, dayOfWeek },
    });
  }

  async upsertWeeklyHours(
    fieldId: string,
    hours: WeeklyOpeningHourInput[],
  ): Promise<FieldOpeningHourEntity[]> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Delete previous weekly configuration for field
      await manager.delete(FieldOpeningHourEntity, { fieldId });

      // 2. Create and bulk save new records
      const entities = hours.map((hour) =>
        manager.create(FieldOpeningHourEntity, {
          id: randomUUID(),
          fieldId,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.isClosed ? null : (hour.openTime ?? null),
          closeTime: hour.isClosed ? null : (hour.closeTime ?? null),
          isClosed: hour.isClosed,
        }),
      );

      return manager.save(entities);
    });
  }
}
