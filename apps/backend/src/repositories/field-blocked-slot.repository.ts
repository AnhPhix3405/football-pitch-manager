import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';

export interface BlockedSlotFilter {
  date?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class FieldBlockedSlotRepository extends BaseRepository<FieldBlockedSlotEntity> {
  constructor(
    @InjectRepository(FieldBlockedSlotEntity)
    repository: Repository<FieldBlockedSlotEntity>,
  ) {
    super(repository);
  }

  async findOverlappingSlots(
    courtId: string,
    blockedDate: string,
    startTime: string,
    endTime: string,
  ): Promise<FieldBlockedSlotEntity[]> {
    return this.repository
      .createQueryBuilder('slot')
      .where('slot.fieldCourtId = :courtId', { courtId })
      .andWhere('slot.blockedDate = :blockedDate', { blockedDate })
      .andWhere('slot.startTime < :endTime AND slot.endTime > :startTime', {
        startTime,
        endTime,
      })
      .orderBy('slot.startTime', 'ASC')
      .getMany();
  }

  async findByCourtId(
    courtId: string,
    filter?: BlockedSlotFilter,
  ): Promise<FieldBlockedSlotEntity[]> {
    const where: FindOptionsWhere<FieldBlockedSlotEntity> = {
      fieldCourtId: courtId,
    };

    if (filter?.date) {
      where.blockedDate = filter.date;
    } else if (filter?.startDate && filter?.endDate) {
      where.blockedDate = Between(filter.startDate, filter.endDate);
    }

    return this.repository.find({
      where,
      order: { blockedDate: 'ASC', startTime: 'ASC' },
    });
  }

  async findByIdAndCourtId(
    id: string,
    courtId: string,
  ): Promise<FieldBlockedSlotEntity | null> {
    return this.repository.findOne({
      where: { id, fieldCourtId: courtId },
    });
  }
}
