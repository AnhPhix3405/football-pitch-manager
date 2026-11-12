/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { BookingEntity } from '~/entities/booking.entity';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { FieldPricingEntity } from '~/entities/field-pricing.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldBlockedSlotRepository } from '~/repositories/field-blocked-slot.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { FieldAvailableSlotsService } from './field-available-slots.service';

describe('FieldAvailableSlotsService', () => {
  const courtRepository = {
    findByFieldId: jest.fn(),
  } as unknown as jest.Mocked<FieldCourtRepository>;
  const blockedSlotRepository = {
    findOverlappingSlotsByCourtsAndDate: jest.fn(),
  } as unknown as jest.Mocked<FieldBlockedSlotRepository>;
  const bookingRepository = {
    findActiveBookingsByCourtsAndDate: jest.fn(),
  } as unknown as jest.Mocked<BookingRepository>;
  const openingHourRepository = {
    findByFieldAndDay: jest.fn(),
  } as unknown as jest.Mocked<FieldOpeningHourRepository>;
  const pricingRepository = {
    findByField: jest.fn(),
  } as unknown as jest.Mocked<FieldPricingRepository>;
  const service = new FieldAvailableSlotsService(
    courtRepository,
    blockedSlotRepository,
    bookingRepository,
    openingHourRepository,
    pricingRepository,
  );
  const query = { date: '2026-10-26', courtType: '7' };

  beforeEach(() => {
    jest.clearAllMocks();
    openingHourRepository.findByFieldAndDay.mockResolvedValue({
      isClosed: false,
      openTime: '17:00',
      closeTime: '20:00',
    } as FieldOpeningHourEntity);
    courtRepository.findByFieldId.mockResolvedValue([
      { id: 'c-1', type: '7' },
      { id: 'c-2', type: '7' },
    ] as FieldCourtEntity[]);
    blockedSlotRepository.findOverlappingSlotsByCourtsAndDate.mockResolvedValue(
      [],
    );
    bookingRepository.findActiveBookingsByCourtsAndDate.mockResolvedValue([]);
    pricingRepository.findByField.mockResolvedValue([
      { startTime: '17:00', endTime: '18:00', price: '500000' },
      { startTime: '18:00', endTime: '19:00', price: '400000' },
      { startTime: '19:00', endTime: '20:00', price: '300000' },
    ] as FieldPricingEntity[]);
  });

  it('returns no slots when the field is closed', async () => {
    openingHourRepository.findByFieldAndDay.mockResolvedValue({
      isClosed: true,
    } as FieldOpeningHourEntity);

    const response = await service.getAvailableSlots('f-1', query);

    expect(response.isClosed).toBe(true);
    expect(response.slots).toEqual([]);
    expect(courtRepository.findByFieldId).not.toHaveBeenCalled();
  });

  it('returns only configured slots and marks occupied slots unavailable', async () => {
    blockedSlotRepository.findOverlappingSlotsByCourtsAndDate.mockResolvedValue(
      [
        {
          fieldCourtId: 'c-1',
          startTime: '17:30:00',
          endTime: '18:30:00',
        } as FieldBlockedSlotEntity,
      ],
    );
    bookingRepository.findActiveBookingsByCourtsAndDate.mockResolvedValue([
      {
        fieldCourtId: 'c-2',
        startTime: '18:00:00',
        endTime: '19:00:00',
      } as BookingEntity,
    ]);

    const response = await service.getAvailableSlots('f-1', query);

    expect(response.slots).toEqual([
      {
        startTime: '17:00',
        endTime: '18:00',
        availableCourts: 1,
        isAvailable: true,
        price: 500000,
      },
      {
        startTime: '18:00',
        endTime: '19:00',
        availableCourts: 0,
        isAvailable: false,
        price: 400000,
      },
      {
        startTime: '19:00',
        endTime: '20:00',
        availableCourts: 2,
        isAvailable: true,
        price: 300000,
      },
    ]);
    expect(courtRepository.findByFieldId).toHaveBeenCalledWith('f-1', {
      status: 'active',
      type: '7',
    });
    expect(
      bookingRepository.findActiveBookingsByCourtsAndDate,
    ).toHaveBeenCalledTimes(1);
  });

  it('uses configured interval lengths and selected date day type', async () => {
    openingHourRepository.findByFieldAndDay.mockResolvedValue({
      isClosed: false,
      openTime: '06:30:00',
      closeTime: '09:00:00',
    } as FieldOpeningHourEntity);
    pricingRepository.findByField.mockResolvedValue([
      { startTime: '06:00', endTime: '07:30', price: '500000' },
      { startTime: '07:35', endTime: '08:45', price: '400000' },
    ] as FieldPricingEntity[]);

    const response = await service.getAvailableSlots('f-1', query);

    expect(response.slots).toEqual([
      {
        startTime: '07:35',
        endTime: '08:45',
        availableCourts: 2,
        isAvailable: true,
        price: 400000,
      },
    ]);
    expect(pricingRepository.findByField).toHaveBeenCalledWith('f-1', {
      courtType: '7',
      dayType: 'weekday',
    });
  });
});
