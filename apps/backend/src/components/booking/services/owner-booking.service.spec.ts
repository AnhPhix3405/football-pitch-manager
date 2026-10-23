/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DataSource, EntityManager } from 'typeorm';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { BookingStateMachineService } from './booking-state-machine.service';
import { OwnerBookingService } from './owner-booking.service';

describe('OwnerBookingService', () => {
  let service: OwnerBookingService;
  let bookingRepository: jest.Mocked<BookingRepository>;
  let fieldCourtRepository: jest.Mocked<FieldCourtRepository>;
  let stateMachineService: jest.Mocked<BookingStateMachineService>;
  let dataSource: jest.Mocked<DataSource>;
  let em: jest.Mocked<EntityManager>;

  beforeEach(() => {
    bookingRepository = {
      findDetailById: jest.fn(),
      findOwnerBookings: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    fieldCourtRepository = {
      findByIdAndFieldId: jest.fn(),
    } as unknown as jest.Mocked<FieldCourtRepository>;

    stateMachineService = {
      transitionStatus: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BookingStateMachineService>;

    em = {
      createQueryBuilder: jest.fn(),
      save: jest
        .fn()
        .mockImplementation((_entity, data) => Promise.resolve(data)),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: any) => cb(em)),
    } as unknown as jest.Mocked<DataSource>;

    service = new OwnerBookingService(
      bookingRepository,
      fieldCourtRepository,
      stateMachineService,
      dataSource,
    );
  });

  describe('confirmBooking', () => {
    it('throws COURT_TYPE_MISMATCH when court type differs from requested', async () => {
      bookingRepository.findDetailById.mockResolvedValue({
        id: 'b-1',
        fieldId: 'f-1',
        status: 'pending',
        requestedCourtType: '5',
      } as BookingEntity);

      fieldCourtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'c-1',
        fieldId: 'f-1',
        type: '7',
        status: 'active',
      } as FieldCourtEntity);

      await expect(
        service.confirmBooking('f-1', 'b-1', 'owner-1', {
          fieldCourtId: 'c-1',
        }),
      ).rejects.toThrow();
    });

    it('throws COURT_ALREADY_OCCUPIED when court has conflicting confirmed booking', async () => {
      bookingRepository.findDetailById.mockResolvedValue({
        id: 'b-1',
        fieldId: 'f-1',
        status: 'pending',
        requestedCourtType: '5',
        bookingDate: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
      } as BookingEntity);

      fieldCourtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'c-1',
        fieldId: 'f-1',
        type: '5',
        status: 'active',
      } as FieldCourtEntity);

      const qbConflict: any = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'b-other-confirmed' }),
      };
      em.createQueryBuilder.mockReturnValue(qbConflict);

      await expect(
        service.confirmBooking('f-1', 'b-1', 'owner-1', {
          fieldCourtId: 'c-1',
        }),
      ).rejects.toThrow();
    });

    it('assigns court and confirms booking when court is available', async () => {
      const mockBooking = {
        id: 'b-1',
        fieldId: 'f-1',
        status: 'pending',
        requestedCourtType: '5',
        bookingDate: '2026-10-26',
        startTime: '08:00',
        endTime: '10:00',
      } as BookingEntity;

      bookingRepository.findDetailById.mockResolvedValue(mockBooking);

      fieldCourtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'c-1',
        fieldId: 'f-1',
        type: '5',
        status: 'active',
      } as FieldCourtEntity);

      const qbNoConflict: any = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      em.createQueryBuilder.mockReturnValue(qbNoConflict);

      const res = await service.confirmBooking('f-1', 'b-1', 'owner-1', {
        fieldCourtId: 'c-1',
        note: 'Sân số 1 đẹp',
      });

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(stateMachineService.transitionStatus).toHaveBeenCalledWith(
        em,
        mockBooking,
        'confirmed',
        'owner-1',
        'owner',
        'Sân số 1 đẹp',
      );
      expect(res).toBeDefined();
    });
  });

  describe('rejectBooking', () => {
    it('rejects booking and records owner note', async () => {
      const mockBooking = {
        id: 'b-1',
        fieldId: 'f-1',
        status: 'pending',
      } as BookingEntity;

      bookingRepository.findDetailById.mockResolvedValue(mockBooking);

      const res = await service.rejectBooking('f-1', 'b-1', 'owner-1', {
        reason: 'Hết chỗ',
      });

      expect(stateMachineService.transitionStatus).toHaveBeenCalledWith(
        em,
        mockBooking,
        'rejected',
        'owner-1',
        'owner',
        'Hết chỗ',
      );
      expect(res).toBeDefined();
    });
  });
});
