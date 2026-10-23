/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DataSource, EntityManager } from 'typeorm';
import { FieldAvailabilityService } from '~/components/field/services/field-availability.service';
import { FieldPricingCalculatorService } from '~/components/field/services/field-pricing-calculator.service';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { FieldServiceEntity } from '~/entities/field-service.entity';
import { FieldEntity } from '~/entities/field.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { BookingStateMachineService } from './booking-state-machine.service';
import { UserBookingService } from './user-booking.service';

describe('UserBookingService', () => {
  let service: UserBookingService;
  let bookingRepository: jest.Mocked<BookingRepository>;
  let fieldRepository: jest.Mocked<FieldRepository>;
  let openingHourRepository: jest.Mocked<FieldOpeningHourRepository>;
  let fieldServiceRepository: jest.Mocked<FieldServiceRepository>;
  let pricingCalculatorService: jest.Mocked<FieldPricingCalculatorService>;
  let availabilityService: jest.Mocked<FieldAvailabilityService>;
  let stateMachineService: jest.Mocked<BookingStateMachineService>;
  let dataSource: jest.Mocked<DataSource>;
  let em: jest.Mocked<EntityManager>;

  beforeEach(() => {
    bookingRepository = {
      findDetailById: jest.fn(),
      findUserBookings: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    fieldRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<FieldRepository>;

    openingHourRepository = {
      findByFieldAndDay: jest.fn(),
    } as unknown as jest.Mocked<FieldOpeningHourRepository>;

    fieldServiceRepository = {
      findByFieldId: jest.fn(),
    } as unknown as jest.Mocked<FieldServiceRepository>;

    pricingCalculatorService = {
      calculateQuote: jest.fn(),
    } as unknown as jest.Mocked<FieldPricingCalculatorService>;

    availabilityService = {
      checkCourtTypeAvailability: jest.fn(),
    } as unknown as jest.Mocked<FieldAvailabilityService>;

    stateMachineService = {
      recordInitialStatus: jest.fn().mockResolvedValue(undefined),
      transitionStatus: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BookingStateMachineService>;

    em = {
      create: jest.fn().mockImplementation((_entity, data) => data),
      save: jest
        .fn()
        .mockImplementation((_entity, data) => Promise.resolve(data)),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: any) => cb(em)),
    } as unknown as jest.Mocked<DataSource>;

    service = new UserBookingService(
      bookingRepository,
      fieldRepository,
      openingHourRepository,
      fieldServiceRepository,
      pricingCalculatorService,
      availabilityService,
      stateMachineService,
      dataSource,
    );
  });

  describe('createBooking', () => {
    it('throws INVALID_TIME_RANGE when startTime >= endTime', async () => {
      await expect(
        service.createBooking('u-1', {
          fieldId: 'f-1',
          courtType: '5',
          bookingDate: '2026-10-26',
          startTime: '10:00',
          endTime: '09:00',
        }),
      ).rejects.toThrow();
    });

    it('throws FIELD_NOT_FOUND when field is missing or inactive', async () => {
      fieldRepository.findById.mockResolvedValue(null);

      await expect(
        service.createBooking('u-1', {
          fieldId: 'f-1',
          courtType: '5',
          bookingDate: '2026-10-26',
          startTime: '08:00',
          endTime: '10:00',
        }),
      ).rejects.toThrow();
    });

    it('throws OUTSIDE_OPENING_HOURS when field is closed or time is outside hours', async () => {
      fieldRepository.findById.mockResolvedValue({
        id: 'f-1',
        status: 'active',
      } as FieldEntity);
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '08:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);

      await expect(
        service.createBooking('u-1', {
          fieldId: 'f-1',
          courtType: '5',
          bookingDate: '2026-10-26',
          startTime: '06:00',
          endTime: '08:00',
        }),
      ).rejects.toThrow();
    });

    it('throws COURT_UNAVAILABLE when no court is available', async () => {
      fieldRepository.findById.mockResolvedValue({
        id: 'f-1',
        status: 'active',
      } as FieldEntity);
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);
      availabilityService.checkCourtTypeAvailability.mockResolvedValue({
        isOpen: true,
        fieldId: 'f-1',
        date: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
        courtTypes: [
          {
            courtType: '5',
            isAvailable: false,
            availableCourts: 0,
            totalCourts: 2,
            availableCourtIds: [],
          },
        ],
      });

      await expect(
        service.createBooking('u-1', {
          fieldId: 'f-1',
          courtType: '5',
          bookingDate: '2026-10-26',
          startTime: '08:00',
          endTime: '10:00',
        }),
      ).rejects.toThrow();
    });

    it('creates booking with snapshot of pitch price and services', async () => {
      fieldRepository.findById.mockResolvedValue({
        id: 'f-1',
        status: 'active',
      } as FieldEntity);
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);
      availabilityService.checkCourtTypeAvailability.mockResolvedValue({
        isOpen: true,
        fieldId: 'f-1',
        date: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
        courtTypes: [
          {
            courtType: '5',
            isAvailable: true,
            availableCourts: 2,
            totalCourts: 2,
            availableCourtIds: ['c-1', 'c-2'],
          },
        ],
      });
      pricingCalculatorService.calculateQuote.mockResolvedValue({
        fieldId: 'f-1',
        courtType: '5',
        date: '2026-10-26',
        dayType: 'weekday',
        startTime: '08:00',
        endTime: '10:00',
        totalDurationHours: 2,
        totalPrice: 400000,
        breakdowns: [],
      });
      fieldServiceRepository.findByFieldId.mockResolvedValue([
        {
          id: 's-water',
          name: 'Nước suối',
          price: '20000',
          isActive: true,
        } as FieldServiceEntity,
      ]);

      const mockSavedBooking = {
        id: 'b-new',
        fieldId: 'f-1',
        userId: 'u-1',
        requestedCourtType: '5',
        bookingDate: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
        status: 'pending',
        totalPrice: '440000',
        depositAmount: '132000',
        paymentStatus: 'unpaid',
        services: [
          {
            serviceId: 's-water',
            quantity: 2,
            priceSnapshot: '20000',
            service: { name: 'Nước suối' },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as BookingEntity;

      bookingRepository.findDetailById.mockResolvedValue(mockSavedBooking);

      const result = await service.createBooking('u-1', {
        fieldId: 'f-1',
        courtType: '5',
        bookingDate: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
        services: [{ serviceId: 's-water', quantity: 2 }],
      });

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result.totalPrice).toBe(440000);
      expect(result.depositAmount).toBe(132000);
      expect(result.status).toBe('pending');
    });
  });

  describe('cancelMyBooking', () => {
    it('cancels pending booking and records reason', async () => {
      const mockBooking = {
        id: 'b-1',
        userId: 'u-1',
        status: 'pending',
      } as BookingEntity;

      bookingRepository.findDetailById.mockResolvedValue(mockBooking);

      const result = await service.cancelMyBooking('u-1', 'b-1', {
        reason: 'Bận việc đột xuất',
      });

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(stateMachineService.transitionStatus).toHaveBeenCalledWith(
        em,
        mockBooking,
        'cancelled',
        'u-1',
        'user',
        'Bận việc đột xuất',
      );
      expect(result).toBeDefined();
    });
  });
});
