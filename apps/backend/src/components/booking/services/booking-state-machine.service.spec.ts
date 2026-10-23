/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { EntityManager } from 'typeorm';
import { BookingStatusHistoryEntity } from '~/entities/booking-status-history.entity';
import { BookingEntity } from '~/entities/booking.entity';
import { BookingStatusHistoryRepository } from '~/repositories/booking-status-history.repository';
import { BookingStateMachineService } from './booking-state-machine.service';

describe('BookingStateMachineService', () => {
  let service: BookingStateMachineService;
  let historyRepository: jest.Mocked<BookingStatusHistoryRepository>;
  let em: jest.Mocked<EntityManager>;

  beforeEach(() => {
    historyRepository = {
      findByBookingId: jest.fn(),
    } as unknown as jest.Mocked<BookingStatusHistoryRepository>;

    em = {
      create: jest.fn().mockImplementation((_entity, data) => data),
      save: jest
        .fn()
        .mockImplementation((_entity, data) => Promise.resolve(data)),
    } as unknown as jest.Mocked<EntityManager>;

    service = new BookingStateMachineService(historyRepository);
  });

  describe('validateTransition', () => {
    it('allows valid pending -> confirmed transition for owner', () => {
      expect(() =>
        service.validateTransition('pending', 'confirmed', 'owner'),
      ).not.toThrow();
    });

    it('allows pending -> cancelled transition for user', () => {
      expect(() =>
        service.validateTransition('pending', 'cancelled', 'user'),
      ).not.toThrow();
    });

    it('allows confirmed -> completed transition for owner', () => {
      expect(() =>
        service.validateTransition('confirmed', 'completed', 'owner'),
      ).not.toThrow();
    });

    it('rejects terminal status transition (e.g. cancelled -> pending)', () => {
      expect(() =>
        service.validateTransition('cancelled', 'pending', 'owner'),
      ).toThrow();
    });

    it('rejects forbidden role (e.g. user trying to confirm)', () => {
      expect(() =>
        service.validateTransition('pending', 'confirmed', 'user'),
      ).toThrow();
    });
  });

  describe('transitionStatus', () => {
    it('updates status and saves history', async () => {
      const booking = { id: 'b-1', status: 'pending' } as BookingEntity;

      const result = await service.transitionStatus(
        em,
        booking,
        'confirmed',
        'owner-1',
        'owner',
        'Xác nhận xếp sân',
      );

      expect(em.create).toHaveBeenCalledWith(
        BookingStatusHistoryEntity,
        expect.objectContaining({
          bookingId: 'b-1',
          fromStatus: 'pending',
          toStatus: 'confirmed',
          changedBy: 'owner-1',
          reason: 'Xác nhận xếp sân',
        }),
      );
      expect(result.status).toBe('confirmed');
    });
  });

  describe('getStatusHistories', () => {
    it('returns formatted status history DTOs', async () => {
      historyRepository.findByBookingId.mockResolvedValue([
        {
          id: 'h-1',
          bookingId: 'b-1',
          fromStatus: null,
          toStatus: 'pending',
          changedBy: 'u-1',
          reason: 'Init',
          createdAt: new Date(),
        } as BookingStatusHistoryEntity,
      ]);

      const result = await service.getStatusHistories('b-1');
      expect(result).toHaveLength(1);
      expect(result[0].toStatus).toBe('pending');
    });
  });
});
