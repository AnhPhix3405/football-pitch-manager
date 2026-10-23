/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { BookingEntity } from '~/entities/booking.entity';
import { BookingRepository } from './booking.repository';

describe('BookingRepository', () => {
  let repository: BookingRepository;
  let typeOrmRepository: jest.Mocked<Repository<BookingEntity>>;

  beforeEach(() => {
    typeOrmRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<BookingEntity>>;

    repository = new BookingRepository(typeOrmRepository);
  });

  it('returns empty array when courtIds is empty', async () => {
    const result = await repository.findActiveBookingsByCourtsAndDate(
      [],
      '2026-10-25',
      '08:00',
      '10:00',
    );
    expect(result).toEqual([]);
    expect(typeOrmRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('queries active overlapping bookings by courts and date', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'b-1' }]),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findActiveBookingsByCourtsAndDate(
      ['c-1', 'c-2'],
      '2026-10-25',
      '08:00',
      '10:00',
    );

    expect(qb.where).toHaveBeenCalledWith(
      'booking.fieldCourtId IN (:...courtIds)',
      {
        courtIds: ['c-1', 'c-2'],
      },
    );
    expect(qb.andWhere).toHaveBeenCalledWith(
      'booking.bookingDate = :bookingDate',
      {
        bookingDate: '2026-10-25',
      },
    );
    expect(qb.andWhere).toHaveBeenCalledWith(
      'booking.status NOT IN (:...excludedStatuses)',
      {
        excludedStatuses: ['cancelled', 'rejected'],
      },
    );
    expect(qb.andWhere).toHaveBeenCalledWith('booking.startTime < :endTime', {
      endTime: '10:00',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('booking.endTime > :startTime', {
      startTime: '08:00',
    });
    expect(result).toEqual([{ id: 'b-1' }]);
  });

  it('queries active bookings for a specific court on a date', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'b-1', startTime: '08:00' }]),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findActiveBookingsByCourtAndDate(
      'c-1',
      '2026-10-25',
    );

    expect(qb.where).toHaveBeenCalledWith('booking.fieldCourtId = :courtId', {
      courtId: 'c-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'booking.bookingDate = :bookingDate',
      {
        bookingDate: '2026-10-25',
      },
    );
    expect(qb.orderBy).toHaveBeenCalledWith('booking.startTime', 'ASC');
    expect(result).toHaveLength(1);
  });
});
