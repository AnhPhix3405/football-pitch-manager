/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { BookingStatusHistoryEntity } from '~/entities/booking-status-history.entity';
import { BookingStatusHistoryRepository } from './booking-status-history.repository';

describe('BookingStatusHistoryRepository', () => {
  let repository: BookingStatusHistoryRepository;
  let typeormRepo: jest.Mocked<Repository<BookingStatusHistoryEntity>>;

  beforeEach(() => {
    typeormRepo = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<BookingStatusHistoryEntity>>;
    repository = new BookingStatusHistoryRepository(typeormRepo);
  });

  it('finds status histories by bookingId ordered by createdAt ASC', async () => {
    const mockList = [
      { id: 'h-1', bookingId: 'b-1', fromStatus: null, toStatus: 'pending' },
    ] as BookingStatusHistoryEntity[];
    typeormRepo.find.mockResolvedValue(mockList);

    const result = await repository.findByBookingId('b-1');

    expect(typeormRepo.find).toHaveBeenCalledWith({
      where: { bookingId: 'b-1' },
      relations: { changedByUser: true },
      order: { createdAt: 'ASC' },
    });
    expect(result).toEqual(mockList);
  });
});
