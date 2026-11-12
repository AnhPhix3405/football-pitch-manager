import { Injectable } from '@nestjs/common';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldBlockedSlotRepository } from '~/repositories/field-blocked-slot.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { AvailableSlotsQueryDto } from '../dto/available-slots-query.dto';
import {
  AvailableSlotDto,
  AvailableSlotsResponseDto,
} from '../dto/available-slots-response.dto';

function toMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
}

function overlaps(
  startTime: string,
  endTime: string,
  intervalStart: number,
  intervalEnd: number,
): boolean {
  return (
    toMinutes(startTime) < intervalEnd && toMinutes(endTime) > intervalStart
  );
}

@Injectable()
export class FieldAvailableSlotsService {
  constructor(
    private readonly courtRepository: FieldCourtRepository,
    private readonly blockedSlotRepository: FieldBlockedSlotRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly openingHourRepository: FieldOpeningHourRepository,
    private readonly pricingRepository: FieldPricingRepository,
  ) {}

  async getAvailableSlots(
    fieldId: string,
    query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotsResponseDto> {
    const [year, month, day] = query.date.split('-').map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay() || 7;
    const openingHour = await this.openingHourRepository.findByFieldAndDay(
      fieldId,
      dayOfWeek,
    );

    const isClosed =
      !openingHour ||
      openingHour.isClosed ||
      !openingHour.openTime ||
      !openingHour.closeTime;
    const response: AvailableSlotsResponseDto = {
      date: query.date,
      courtType: query.courtType,
      isClosed: Boolean(isClosed),
      openTime: isClosed ? null : openingHour.openTime!.slice(0, 5),
      closeTime: isClosed ? null : openingHour.closeTime!.slice(0, 5),
      slots: [],
    };
    if (isClosed || !response.openTime || !response.closeTime) return response;

    const openMinutes = toMinutes(response.openTime);
    const closeMinutes = toMinutes(response.closeTime);
    const dayType = dayOfWeek >= 6 ? 'weekend' : 'weekday';
    const [courts, pricingRules] = await Promise.all([
      this.courtRepository.findByFieldId(fieldId, {
        status: 'active',
        type: query.courtType,
      }),
      this.pricingRepository.findByField(fieldId, {
        courtType: query.courtType,
        dayType,
      }),
    ]);

    const courtIds = courts.map((court) => court.id);
    const [blockedSlots, bookings] = await Promise.all([
      this.blockedSlotRepository.findOverlappingSlotsByCourtsAndDate(
        courtIds,
        query.date,
        response.openTime,
        response.closeTime,
      ),
      this.bookingRepository.findActiveBookingsByCourtsAndDate(
        courtIds,
        query.date,
        response.openTime,
        response.closeTime,
      ),
    ]);

    const slots: AvailableSlotDto[] = [];
    for (const rule of pricingRules) {
      const start = toMinutes(rule.startTime);
      const end = toMinutes(rule.endTime);
      if (start < openMinutes || end > closeMinutes) continue;
      const busyCourtIds = new Set([
        ...blockedSlots
          .filter((slot) => overlaps(slot.startTime, slot.endTime, start, end))
          .map((slot) => slot.fieldCourtId),
        ...bookings
          .filter((booking) =>
            overlaps(booking.startTime, booking.endTime, start, end),
          )
          .map((booking) => booking.fieldCourtId),
      ]);
      const availableCourts = courts.filter(
        (court) => !busyCourtIds.has(court.id),
      ).length;
      slots.push({
        startTime: rule.startTime.slice(0, 5),
        endTime: rule.endTime.slice(0, 5),
        availableCourts,
        isAvailable: availableCourts > 0,
        price: Number(rule.price),
      });
    }

    response.slots = slots;
    return response;
  }
}
