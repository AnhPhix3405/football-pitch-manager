/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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
    expect(result).toEqual([{ id: 'b-1', startTime: '08:00' }]);
  });

  it('finds conflicting booking for court with excludeId', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 'b-conflict' }),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findConflictingBookingForCourt(
      'court-1',
      '2026-10-26',
      '14:00',
      '16:00',
      'b-curr',
    );

    expect(qb.where).toHaveBeenCalledWith('booking.fieldCourtId = :courtId', {
      courtId: 'court-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'booking.id != :excludeBookingId',
      {
        excludeBookingId: 'b-curr',
      },
    );
    expect(result).toEqual({ id: 'b-conflict' });
  });

  it('finds user bookings with pagination and filters', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'b-1' }], 1]),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findUserBookings('user-1', {
      status: 'pending',
      bookingDate: '2026-10-26',
      page: 1,
      limit: 10,
    });

    expect(qb.where).toHaveBeenCalledWith('booking.userId = :userId', {
      userId: 'user-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('booking.status = :status', {
      status: 'pending',
    });
    expect(result).toEqual([[{ id: 'b-1' }], 1]);
  });

  it('finds owner bookings with filters', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'b-owner' }], 1]),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findOwnerBookings('f-1', {
      courtType: '5',
      courtId: 'c-1',
    });

    expect(qb.where).toHaveBeenCalledWith('booking.fieldId = :fieldId', {
      fieldId: 'f-1',
    });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'booking.requestedCourtType = :courtType',
      { courtType: '5' },
    );
    expect(result).toEqual([[{ id: 'b-owner' }], 1]);
  });

  it('finds detail by id with all relations', async () => {
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 'b-detail' }),
    };
    typeOrmRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findDetailById('b-1');

    expect(qb.where).toHaveBeenCalledWith('booking.id = :id', { id: 'b-1' });
    expect(result).toEqual({ id: 'b-detail' });
  });
});
