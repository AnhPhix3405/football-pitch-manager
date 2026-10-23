import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { BookingEntity } from '~/entities/booking.entity';

export interface UserBookingFilter {
  status?: string;
  bookingDate?: string;
  page?: number;
  limit?: number;
}

export interface OwnerBookingFilter {
  status?: string;
  bookingDate?: string;
  courtType?: string;
  courtId?: string;
  page?: number;
  limit?: number;
}

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

  async findConflictingBookingForCourt(
    courtId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string,
  ): Promise<BookingEntity | null> {
    const qb = this.repository
      .createQueryBuilder('booking')
      .where('booking.fieldCourtId = :courtId', { courtId })
      .andWhere('booking.bookingDate = :bookingDate', { bookingDate })
      .andWhere('booking.status = :confirmedStatus', {
        confirmedStatus: 'confirmed',
      })
      .andWhere('booking.startTime < :endTime', { endTime })
      .andWhere('booking.endTime > :startTime', { startTime });

    if (excludeBookingId) {
      qb.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    return qb.getOne();
  }

  async findUserBookings(
    userId: string,
    filter?: UserBookingFilter,
  ): Promise<[BookingEntity[], number]> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.field', 'field')
      .leftJoinAndSelect('booking.fieldCourt', 'fieldCourt')
      .leftJoinAndSelect('booking.services', 'services')
      .leftJoinAndSelect('services.service', 'service')
      .where('booking.userId = :userId', { userId });

    if (filter?.status) {
      qb.andWhere('booking.status = :status', { status: filter.status });
    }
    if (filter?.bookingDate) {
      qb.andWhere('booking.bookingDate = :bookingDate', {
        bookingDate: filter.bookingDate,
      });
    }

    return qb
      .orderBy('booking.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }

  async findOwnerBookings(
    fieldId: string,
    filter?: OwnerBookingFilter,
  ): Promise<[BookingEntity[], number]> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.fieldCourt', 'fieldCourt')
      .leftJoinAndSelect('booking.services', 'services')
      .leftJoinAndSelect('services.service', 'service')
      .where('booking.fieldId = :fieldId', { fieldId });

    if (filter?.status) {
      qb.andWhere('booking.status = :status', { status: filter.status });
    }
    if (filter?.bookingDate) {
      qb.andWhere('booking.bookingDate = :bookingDate', {
        bookingDate: filter.bookingDate,
      });
    }
    if (filter?.courtType) {
      qb.andWhere('booking.requestedCourtType = :courtType', {
        courtType: filter.courtType,
      });
    }
    if (filter?.courtId) {
      qb.andWhere('booking.fieldCourtId = :courtId', {
        courtId: filter.courtId,
      });
    }

    return qb
      .orderBy('booking.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }

  async findDetailById(id: string): Promise<BookingEntity | null> {
    return this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.field', 'field')
      .leftJoinAndSelect('booking.fieldCourt', 'fieldCourt')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.services', 'services')
      .leftJoinAndSelect('services.service', 'service')
      .leftJoinAndSelect('booking.statusHistories', 'statusHistories')
      .leftJoinAndSelect('statusHistories.changedByUser', 'changedByUser')
      .where('booking.id = :id', { id })
      .orderBy('statusHistories.createdAt', 'ASC')
      .getOne();
  }
}
