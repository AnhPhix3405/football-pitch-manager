/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldBlockedSlotRepository } from '~/repositories/field-blocked-slot.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldAvailabilityService } from './field-availability.service';

describe('FieldAvailabilityService', () => {
  let service: FieldAvailabilityService;
  let courtRepository: jest.Mocked<FieldCourtRepository>;
  let blockedSlotRepository: jest.Mocked<FieldBlockedSlotRepository>;
  let bookingRepository: jest.Mocked<BookingRepository>;
  let openingHourRepository: jest.Mocked<FieldOpeningHourRepository>;

  beforeEach(() => {
    courtRepository = {
      findByFieldId: jest.fn(),
      findByIdAndFieldId: jest.fn(),
    } as unknown as jest.Mocked<FieldCourtRepository>;

    blockedSlotRepository = {
      findOverlappingSlotsByCourtsAndDate: jest.fn(),
      findOverlappingSlots: jest.fn(),
      findByCourtId: jest.fn(),
    } as unknown as jest.Mocked<FieldBlockedSlotRepository>;

    bookingRepository = {
      findActiveBookingsByCourtsAndDate: jest.fn(),
      findActiveBookingsByCourtAndDate: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    openingHourRepository = {
      findByFieldAndDay: jest.fn(),
    } as unknown as jest.Mocked<FieldOpeningHourRepository>;

    service = new FieldAvailabilityService(
      courtRepository,
      blockedSlotRepository,
      bookingRepository,
      openingHourRepository,
    );
  });

  describe('checkCourtTypeAvailability', () => {
    it('returns isOpen: false and 0 available courts when field is closed', async () => {
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: true,
      } as FieldOpeningHourEntity);

      courtRepository.findByFieldId.mockResolvedValue([
        { id: 'c-1', type: '5', status: 'active' },
      ] as FieldCourtEntity[]);

      const result = await service.checkCourtTypeAvailability('f-1', {
        date: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
        courtType: '5',
      });

      expect(result.isOpen).toBe(false);
      expect(result.courtTypes[0].availableCourts).toBe(0);
      expect(result.courtTypes[0].isAvailable).toBe(false);
    });

    it('calculates available courts excluding blocked slots and active bookings', async () => {
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);

      courtRepository.findByFieldId.mockResolvedValue([
        { id: 'c-1', type: '5', status: 'active' },
        { id: 'c-2', type: '5', status: 'active' },
        { id: 'c-3', type: '5', status: 'active' },
      ] as FieldCourtEntity[]);

      // c-1 is blocked
      blockedSlotRepository.findOverlappingSlotsByCourtsAndDate.mockResolvedValue(
        [{ fieldCourtId: 'c-1' } as FieldBlockedSlotEntity],
      );

      // c-2 is booked
      bookingRepository.findActiveBookingsByCourtsAndDate.mockResolvedValue([
        { fieldCourtId: 'c-2' } as BookingEntity,
      ]);

      const result = await service.checkCourtTypeAvailability('f-1', {
        date: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
        courtType: '5',
      });

      expect(result.isOpen).toBe(true);
      expect(result.courtTypes).toHaveLength(1);
      expect(result.courtTypes[0].totalCourts).toBe(3);
      expect(result.courtTypes[0].availableCourts).toBe(1);
      expect(result.courtTypes[0].isAvailable).toBe(true);
      expect(result.courtTypes[0].availableCourtIds).toEqual(['c-3']);
    });
  });

  describe('validateCourtAssignment', () => {
    it('throws INVALID_COURT_ASSIGNMENT when court is not active or type mismatch', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'c-1',
        type: '7',
        status: 'active',
      } as FieldCourtEntity);

      try {
        await service.validateCourtAssignment(
          'c-1',
          'f-1',
          '5', // expected 5, but court is 7
          '2026-10-26',
          '08:00',
          '10:00',
        );
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toMatchObject({
          code: 'INVALID_COURT_ASSIGNMENT',
        });
      }
    });

    it('throws COURT_NOT_AVAILABLE when slot or booking collision occurs', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'c-1',
        type: '5',
        status: 'active',
      } as FieldCourtEntity);

      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);

      blockedSlotRepository.findOverlappingSlots.mockResolvedValue([
        { id: 's-1' } as FieldBlockedSlotEntity,
      ]);
      bookingRepository.findActiveBookingsByCourtsAndDate.mockResolvedValue([]);

      try {
        await service.validateCourtAssignment(
          'c-1',
          'f-1',
          '5',
          '2026-10-26',
          '08:00',
          '10:00',
        );
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toMatchObject({
          code: 'COURT_NOT_AVAILABLE',
        });
      }
    });

    it('returns true when assignment is valid and free', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'c-1',
        type: '5',
        status: 'active',
      } as FieldCourtEntity);

      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);

      blockedSlotRepository.findOverlappingSlots.mockResolvedValue([]);
      bookingRepository.findActiveBookingsByCourtsAndDate.mockResolvedValue([]);

      const result = await service.validateCourtAssignment(
        'c-1',
        'f-1',
        '5',
        '2026-10-26',
        '08:00',
        '10:00',
      );

      expect(result).toBe(true);
    });
  });
});
