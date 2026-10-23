import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { BookingStatusHistoryEntity } from '~/entities/booking-status-history.entity';

@Injectable()
export class BookingStatusHistoryRepository extends BaseRepository<BookingStatusHistoryEntity> {
  constructor(
    @InjectRepository(BookingStatusHistoryEntity)
    repository: Repository<BookingStatusHistoryEntity>,
  ) {
    super(repository);
  }

  async findByBookingId(
    bookingId: string,
  ): Promise<BookingStatusHistoryEntity[]> {
    return this.repository.find({
      where: { bookingId },
      relations: { changedByUser: true },
      order: { createdAt: 'ASC' },
    });
  }
}
