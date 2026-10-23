/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Repository } from 'typeorm';
import { BookingServiceEntity } from '~/entities/booking-service.entity';
import { BookingServiceRepository } from './booking-service.repository';

describe('BookingServiceRepository', () => {
  let repository: BookingServiceRepository;
  let typeormRepo: jest.Mocked<Repository<BookingServiceEntity>>;

  beforeEach(() => {
    typeormRepo = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<BookingServiceEntity>>;
    repository = new BookingServiceRepository(typeormRepo);
  });

  it('finds services by bookingId with service relation', async () => {
    const mockList = [
      { id: 'bs-1', bookingId: 'b-1' },
    ] as BookingServiceEntity[];
    typeormRepo.find.mockResolvedValue(mockList);

    const result = await repository.findByBookingId('b-1');

    expect(typeormRepo.find).toHaveBeenCalledWith({
      where: { bookingId: 'b-1' },
      relations: { service: true },
    });
    expect(result).toEqual(mockList);
  });
});
