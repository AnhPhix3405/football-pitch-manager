import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { BookingEntity } from '~/entities/booking.entity';

@Injectable()
export class BookingRepository extends BaseRepository<BookingEntity> {
  constructor(
    @InjectRepository(BookingEntity)
    repository: Repository<BookingEntity>,
  ) {
    super(repository);
  }

  async findActiveBookingsByCourtsAndDate(
    courtIds: string[],
    bookingDate: string,
    startTime: string,
    endTime: string,
  ): Promise<BookingEntity[]> {
    if (!courtIds || courtIds.length === 0) {
      return [];
    }

    return this.repository
      .createQueryBuilder('booking')
      .where('booking.fieldCourtId IN (:...courtIds)', { courtIds })
      .andWhere('booking.bookingDate = :bookingDate', { bookingDate })
      .andWhere('booking.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['cancelled', 'rejected'],
      })
      .andWhere('booking.startTime < :endTime', { endTime })
      .andWhere('booking.endTime > :startTime', { startTime })
      .getMany();
  }

  async findActiveBookingsByCourtAndDate(
    courtId: string,
    bookingDate: string,
  ): Promise<BookingEntity[]> {
    return this.repository
      .createQueryBuilder('booking')
      .where('booking.fieldCourtId = :courtId', { courtId })
      .andWhere('booking.bookingDate = :bookingDate', { bookingDate })
      .andWhere('booking.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['cancelled', 'rejected'],
      })
      .orderBy('booking.startTime', 'ASC')
      .getMany();
  }
}
