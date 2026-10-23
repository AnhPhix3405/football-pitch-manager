/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { UserBookingController } from './user-booking.controller';
import { UserBookingService } from '../services/user-booking.service';
import { BookingResponseDto } from '../dto/booking-response.dto';

describe('UserBookingController', () => {
  let controller: UserBookingController;
  let service: jest.Mocked<UserBookingService>;

  beforeEach(() => {
    service = {
      createBooking: jest.fn(),
      getMyBookings: jest.fn(),
      getBookingDetail: jest.fn(),
      cancelMyBooking: jest.fn(),
    } as unknown as jest.Mocked<UserBookingService>;

    controller = new UserBookingController(service);
  });

  it('creates booking', async () => {
    const mockRes = { id: 'b-1', status: 'pending' } as BookingResponseDto;
    service.createBooking.mockResolvedValue(mockRes);

    const dto = {
      fieldId: 'f-1',
      courtType: '5',
      bookingDate: '2026-10-26',
      startTime: '08:00',
      endTime: '10:00',
    };

    const res = await controller.createBooking('u-1', dto);
    expect(service.createBooking).toHaveBeenCalledWith('u-1', dto);
    expect(res).toEqual(mockRes);
  });

  it('gets my bookings', async () => {
    const mockRes = { data: [], total: 0, page: 1, limit: 10 };
    service.getMyBookings.mockResolvedValue(mockRes);

    const res = await controller.getMyBookings('u-1', { page: 1, limit: 10 });
    expect(service.getMyBookings).toHaveBeenCalledWith('u-1', {
      page: 1,
      limit: 10,
    });
    expect(res).toEqual(mockRes);
  });

  it('gets booking detail', async () => {
    const mockRes = { id: 'b-1' } as BookingResponseDto;
    service.getBookingDetail.mockResolvedValue(mockRes);

    const res = await controller.getBookingDetail('u-1', 'b-1');
    expect(service.getBookingDetail).toHaveBeenCalledWith('u-1', 'b-1');
    expect(res).toEqual(mockRes);
  });

  it('cancels my booking', async () => {
    const mockRes = { id: 'b-1', status: 'cancelled' } as BookingResponseDto;
    service.cancelMyBooking.mockResolvedValue(mockRes);

    const res = await controller.cancelMyBooking('u-1', 'b-1', {
      reason: 'Busy',
    });
    expect(service.cancelMyBooking).toHaveBeenCalledWith('u-1', 'b-1', {
      reason: 'Busy',
    });
    expect(res).toEqual(mockRes);
  });
});
