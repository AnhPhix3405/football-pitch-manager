import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldBlockedSlotRepository } from '~/repositories/field-blocked-slot.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { CheckAvailabilityQueryDto } from '../dto/check-availability-query.dto';
import { CourtTimelineQueryDto } from '../dto/court-timeline-query.dto';
import {
  CourtTimelineItemDto,
  CourtTimelineResponseDto,
} from '../dto/court-timeline-response.dto';
import {
  CourtTypeAvailabilityDto,
  FieldAvailabilityResponseDto,
} from '../dto/field-availability-response.dto';

const parseMinutes = (timeStr: string): number => {
  const [hh, mm] = timeStr.slice(0, 5).split(':').map(Number);
  return hh * 60 + mm;
};

@Injectable()
export class FieldAvailabilityService {
  constructor(
    private readonly courtRepository: FieldCourtRepository,
    private readonly blockedSlotRepository: FieldBlockedSlotRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly openingHourRepository: FieldOpeningHourRepository,
  ) {}

  async checkCourtTypeAvailability(
    fieldId: string,
    query: CheckAvailabilityQueryDto,
  ): Promise<FieldAvailabilityResponseDto> {
    const reqStart = parseMinutes(query.startTime);
    const reqEnd = parseMinutes(query.endTime);

    if (reqStart >= reqEnd) {
      throw new ApplicationException({
        code: 'INVALID_TIME_RANGE',
        messageKey: 'error.invalidTimeRange',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 1. Check opening hours
    const [year, month, day] = query.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay();
    const isoDayOfWeek = jsDay === 0 ? 7 : jsDay;

    const openingHour = await this.openingHourRepository.findByFieldAndDay(
      fieldId,
      isoDayOfWeek,
    );

    let isOpen = true;
    if (
      !openingHour ||
      openingHour.isClosed ||
      !openingHour.openTime ||
      !openingHour.closeTime
    ) {
      isOpen = false;
    } else {
      const openMin = parseMinutes(openingHour.openTime);
      const closeMin = parseMinutes(openingHour.closeTime);
      if (reqStart < openMin || reqEnd > closeMin) {
        isOpen = false;
      }
    }

    // 2. Fetch active courts for field (filtered by courtType if provided)
    const activeCourts = await this.courtRepository.findByFieldId(fieldId, {
      status: 'active',
      type: query.courtType,
    });

    const courtTypesToEvaluate = query.courtType
      ? [query.courtType]
      : ['5', '7', '11'];

    if (!isOpen) {
      const courtTypes: CourtTypeAvailabilityDto[] = courtTypesToEvaluate.map(
        (type) => {
          const courtsOfType = activeCourts.filter((c) => c.type === type);
          return {
            courtType: type,
            totalCourts: courtsOfType.length,
            availableCourts: 0,
            isAvailable: false,
            availableCourtIds: [],
          };
        },
      );

      return {
        fieldId,
        date: query.date,
        startTime: query.startTime,
        endTime: query.endTime,
        isOpen: false,
        courtTypes,
      };
    }

    // 3. Find busy courts from blocked slots & active bookings
    const activeCourtIds = activeCourts.map((c) => c.id);

    const [blockedSlots, activeBookings] = await Promise.all([
      this.blockedSlotRepository.findOverlappingSlotsByCourtsAndDate(
        activeCourtIds,
        query.date,
        query.startTime,
        query.endTime,
      ),
      this.bookingRepository.findActiveBookingsByCourtsAndDate(
        activeCourtIds,
        query.date,
        query.startTime,
        query.endTime,
      ),
    ]);

    const busyCourtIdSet = new Set<string>([
      ...blockedSlots.map((s) => s.fieldCourtId),
      ...activeBookings.map((b) => b.fieldCourtId!).filter(Boolean),
    ]);

    // 4. Group results by court type
    const courtTypes: CourtTypeAvailabilityDto[] = courtTypesToEvaluate.map(
      (type) => {
        const courtsOfType = activeCourts.filter((c) => c.type === type);
        const freeCourts = courtsOfType.filter(
          (court) => !busyCourtIdSet.has(court.id),
        );

        return {
          courtType: type,
          totalCourts: courtsOfType.length,
          availableCourts: freeCourts.length,
          isAvailable: freeCourts.length > 0,
          availableCourtIds: freeCourts.map((c) => c.id),
        };
      },
    );

    return {
      fieldId,
      date: query.date,
      startTime: query.startTime,
      endTime: query.endTime,
      isOpen: true,
      courtTypes,
    };
  }

  async getCourtTimeline(
    fieldId: string,
    query: CourtTimelineQueryDto,
  ): Promise<CourtTimelineResponseDto> {
    const [year, month, day] = query.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay();
    const isoDayOfWeek = jsDay === 0 ? 7 : jsDay;

    const openingHour = await this.openingHourRepository.findByFieldAndDay(
      fieldId,
      isoDayOfWeek,
    );

    const allCourts = await this.courtRepository.findByFieldId(fieldId);
    const filteredCourts = query.courtId
      ? allCourts.filter((c) => c.id === query.courtId)
      : allCourts;

    const courts: CourtTimelineItemDto[] = await Promise.all(
      filteredCourts.map(async (court) => {
        const [blockedSlots, bookings] = await Promise.all([
          this.blockedSlotRepository.findByCourtId(court.id, {
            date: query.date,
          }),
          this.bookingRepository.findActiveBookingsByCourtAndDate(
            court.id,
            query.date,
          ),
        ]);

        return {
          courtId: court.id,
          courtName: court.name,
          courtType: court.type,
          status: court.status,
          blockedSlots: blockedSlots.map((s) => ({
            id: s.id,
            startTime: s.startTime.slice(0, 5),
            endTime: s.endTime.slice(0, 5),
            reason: s.reason,
          })),
          bookings: bookings.map((b) => ({
            id: b.id,
            startTime: b.startTime.slice(0, 5),
            endTime: b.endTime.slice(0, 5),
            status: b.status,
          })),
        };
      }),
    );

    return {
      fieldId,
      date: query.date,
      openTime: openingHour?.openTime ? openingHour.openTime.slice(0, 5) : null,
      closeTime: openingHour?.closeTime
        ? openingHour.closeTime.slice(0, 5)
        : null,
      isClosed: openingHour ? openingHour.isClosed : true,
      courts,
    };
  }

  async validateCourtAssignment(
    courtId: string,
    fieldId: string,
    courtType: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const court = await this.courtRepository.findByIdAndFieldId(
      courtId,
      fieldId,
    );
    if (!court || court.type !== courtType || court.status !== 'active') {
      throw new ApplicationException({
        code: 'INVALID_COURT_ASSIGNMENT',
        messageKey: 'error.invalidCourtAssignment',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Opening hours check
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay();
    const isoDayOfWeek = jsDay === 0 ? 7 : jsDay;

    const openingHour = await this.openingHourRepository.findByFieldAndDay(
      fieldId,
      isoDayOfWeek,
    );
    if (
      !openingHour ||
      openingHour.isClosed ||
      !openingHour.openTime ||
      !openingHour.closeTime
    ) {
      throw new ApplicationException({
        code: 'OUTSIDE_OPENING_HOURS',
        messageKey: 'error.outsideOpeningHours',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const openMin = parseMinutes(openingHour.openTime);
    const closeMin = parseMinutes(openingHour.closeTime);
    const reqStart = parseMinutes(startTime);
    const reqEnd = parseMinutes(endTime);

    if (reqStart < openMin || reqEnd > closeMin) {
      throw new ApplicationException({
        code: 'OUTSIDE_OPENING_HOURS',
        messageKey: 'error.outsideOpeningHours',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Check collision on blocked slots and bookings
    const [blockedSlots, bookings] = await Promise.all([
      this.blockedSlotRepository.findOverlappingSlots(
        courtId,
        date,
        startTime,
        endTime,
      ),
      this.bookingRepository.findActiveBookingsByCourtsAndDate(
        [courtId],
        date,
        startTime,
        endTime,
      ),
    ]);

    if (blockedSlots.length > 0 || bookings.length > 0) {
      throw new ApplicationException({
        code: 'COURT_NOT_AVAILABLE',
        messageKey: 'error.courtNotAvailable',
        status: HttpStatus.CONFLICT,
      });
    }

    return true;
  }
}
