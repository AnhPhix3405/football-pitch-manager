import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '~/core/base/base-repositories';
import { BookingServiceEntity } from '~/entities/booking-service.entity';

@Injectable()
export class BookingServiceRepository extends BaseRepository<BookingServiceEntity> {
  constructor(
    @InjectRepository(BookingServiceEntity)
    repository: Repository<BookingServiceEntity>,
  ) {
    super(repository);
  }

  async findByBookingId(bookingId: string): Promise<BookingServiceEntity[]> {
    return this.repository.find({
      where: { bookingId },
      relations: { service: true },
    });
  }
}
