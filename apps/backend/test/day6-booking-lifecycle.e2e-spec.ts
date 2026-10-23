/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { configureApplication } from '../src/common/configure-application';
import { ApplicationException } from '../src/common/exceptions/application.exception';
import { AccountStatusGuard } from '../src/components/auth/guards/account-status.guard';
import { JwtAuthGuard } from '../src/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/components/auth/guards/roles.guard';
import { OwnerBookingController } from '../src/components/booking/controllers/owner-booking.controller';
import { UserBookingController } from '../src/components/booking/controllers/user-booking.controller';
import { OwnerBookingService } from '../src/components/booking/services/owner-booking.service';
import { UserBookingService } from '../src/components/booking/services/user-booking.service';
import { FieldOwnershipGuard } from '../src/components/field/guards/field-ownership.guard';

describe('Day 6 Booking Lifecycle & Concurrency API (e2e)', () => {
  let app: NestFastifyApplication;

  const mockUserBookingService = {
    createBooking: jest.fn(),
    getMyBookings: jest.fn(),
    getBookingDetail: jest.fn(),
    cancelMyBooking: jest.fn(),
  };

  const mockOwnerBookingService = {
    getOwnerBookings: jest.fn(),
    getBookingDetail: jest.fn(),
    confirmBooking: jest.fn(),
    rejectBooking: jest.fn(),
    cancelBooking: jest.fn(),
    completeBooking: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserBookingController, OwnerBookingController],
      providers: [
        {
          provide: UserBookingService,
          useValue: mockUserBookingService,
        },
        {
          provide: OwnerBookingService,
          useValue: mockOwnerBookingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'u-1', email: 'user@test.com', role: 'user' };
          return true;
        },
      })
      .overrideGuard(AccountStatusGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(FieldOwnershipGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApplication(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /bookings creates pending booking with snapshot', async () => {
    mockUserBookingService.createBooking.mockResolvedValue({
      id: 'b-1',
      fieldId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      requestedCourtType: '5',
      bookingDate: '2026-10-26',
      startTime: '08:00',
      endTime: '10:00',
      status: 'pending',
      totalPrice: 400000,
      depositAmount: 120000,
      services: [],
    });

    const res = await app.inject({
      method: 'POST',
      url: '/bookings',
      payload: {
        fieldId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        courtType: '5',
        bookingDate: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.data.id).toBe('b-1');
    expect(body.data.status).toBe('pending');
    expect(body.data.totalPrice).toBe(400000);
  });

  it('GET /bookings/me returns user bookings list', async () => {
    mockUserBookingService.getMyBookings.mockResolvedValue({
      data: [{ id: 'b-1', status: 'pending' }],
      total: 1,
      page: 1,
      limit: 10,
    });

    const res = await app.inject({
      method: 'GET',
      url: '/bookings/me',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.total).toBe(1);
    expect(body.data.data[0].id).toBe('b-1');
  });

  it('POST /owner/fields/:fieldId/bookings/:bookingId/confirm assigns court and confirms', async () => {
    mockOwnerBookingService.confirmBooking.mockResolvedValue({
      id: 'b-1',
      fieldCourtId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      status: 'confirmed',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/bookings/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/confirm',
      payload: {
        fieldCourtId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        note: 'Sân 1 đã sẵn sàng',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.status).toBe('confirmed');
  });

  it('POST /owner/fields/:fieldId/bookings/:bookingId/confirm handles double booking concurrency conflict (409)', async () => {
    mockOwnerBookingService.confirmBooking.mockRejectedValue(
      new ApplicationException({
        code: 'COURT_ALREADY_OCCUPIED',
        messageKey: 'error.courtAlreadyOccupied',
        status: HttpStatus.CONFLICT,
      }),
    );

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/bookings/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/confirm',
      payload: {
        fieldCourtId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      },
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('COURT_ALREADY_OCCUPIED');
  });

  it('POST /owner/fields/:fieldId/bookings/:bookingId/reject rejects pending booking', async () => {
    mockOwnerBookingService.rejectBooking.mockResolvedValue({
      id: 'b-1',
      status: 'rejected',
      ownerNote: 'Sân bảo trì',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/bookings/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/reject',
      payload: {
        reason: 'Sân bảo trì',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.status).toBe('rejected');
  });

  it('POST /owner/fields/:fieldId/bookings/:bookingId/complete marks booking as completed', async () => {
    mockOwnerBookingService.completeBooking.mockResolvedValue({
      id: 'b-1',
      status: 'completed',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/owner/fields/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/bookings/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/complete',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.status).toBe('completed');
  });

  it('POST /bookings/:id/cancel allows user to cancel pending booking', async () => {
    mockUserBookingService.cancelMyBooking.mockResolvedValue({
      id: 'b-1',
      status: 'cancelled',
      cancelReason: 'Bận đột xuất',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/bookings/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/cancel',
      payload: {
        reason: 'Bận đột xuất',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.status).toBe('cancelled');
  });
});
