/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { OwnerBookingController } from './owner-booking.controller';
import { OwnerBookingService } from '../services/owner-booking.service';
import { BookingResponseDto } from '../dto/booking-response.dto';

describe('OwnerBookingController', () => {
  let controller: OwnerBookingController;
  let service: jest.Mocked<OwnerBookingService>;

  beforeEach(() => {
    service = {
      getOwnerBookings: jest.fn(),
      getBookingDetail: jest.fn(),
      confirmBooking: jest.fn(),
      rejectBooking: jest.fn(),
      cancelBooking: jest.fn(),
      completeBooking: jest.fn(),
    } as unknown as jest.Mocked<OwnerBookingService>;

    controller = new OwnerBookingController(service);
  });

  it('gets owner bookings', async () => {
    const mockRes = { data: [], total: 0, page: 1, limit: 10 };
    service.getOwnerBookings.mockResolvedValue(mockRes);

    const res = await controller.getOwnerBookings('f-1', {
      page: 1,
      limit: 10,
    });
    expect(service.getOwnerBookings).toHaveBeenCalledWith('f-1', {
      page: 1,
      limit: 10,
    });
    expect(res).toEqual(mockRes);
  });

  it('confirms booking', async () => {
    const mockRes = { id: 'b-1', status: 'confirmed' } as BookingResponseDto;
    service.confirmBooking.mockResolvedValue(mockRes);

    const res = await controller.confirmBooking('f-1', 'b-1', 'o-1', {
      fieldCourtId: 'c-1',
    });
    expect(service.confirmBooking).toHaveBeenCalledWith('f-1', 'b-1', 'o-1', {
      fieldCourtId: 'c-1',
    });
    expect(res).toEqual(mockRes);
  });

  it('rejects booking', async () => {
    const mockRes = { id: 'b-1', status: 'rejected' } as BookingResponseDto;
    service.rejectBooking.mockResolvedValue(mockRes);

    const res = await controller.rejectBooking('f-1', 'b-1', 'o-1', {
      reason: 'Bận sân',
    });
    expect(service.rejectBooking).toHaveBeenCalledWith('f-1', 'b-1', 'o-1', {
      reason: 'Bận sân',
    });
    expect(res).toEqual(mockRes);
  });

  it('completes booking', async () => {
    const mockRes = { id: 'b-1', status: 'completed' } as BookingResponseDto;
    service.completeBooking.mockResolvedValue(mockRes);

    const res = await controller.completeBooking('f-1', 'b-1', 'o-1');
    expect(service.completeBooking).toHaveBeenCalledWith('f-1', 'b-1', 'o-1');
    expect(res).toEqual(mockRes);
  });
});
