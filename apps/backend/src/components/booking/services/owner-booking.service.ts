import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { OwnerBookingQueryDto } from '../dto/owner-booking-query.dto';
import { RejectBookingDto } from '../dto/reject-booking.dto';
import { BookingStateMachineService } from './booking-state-machine.service';

@Injectable()
export class OwnerBookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly fieldCourtRepository: FieldCourtRepository,
    private readonly stateMachineService: BookingStateMachineService,
    private readonly dataSource: DataSource,
  ) {}

  async getOwnerBookings(
    fieldId: string,
    query: OwnerBookingQueryDto,
  ): Promise<{
    data: BookingResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [list, total] = await this.bookingRepository.findOwnerBookings(
      fieldId,
      query,
    );
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return {
      data: list.map((item) => BookingResponseDto.fromEntity(item)),
      total,
      page,
      limit,
    };
  }

  async getBookingDetail(
    fieldId: string,
    bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.fieldId !== fieldId) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return BookingResponseDto.fromEntity(booking);
  }

  async confirmBooking(
    fieldId: string,
    bookingId: string,
    ownerUserId: string,
    dto: ConfirmBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.fieldId !== fieldId) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (booking.status !== 'pending') {
      throw new ApplicationException({
        code: 'INVALID_BOOKING_STATUS_TRANSITION',
        messageKey: 'error.invalidBookingStatusTransition',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const court = await this.fieldCourtRepository.findByIdAndFieldId(
      dto.fieldCourtId,
      fieldId,
    );
    if (!court || court.status !== 'active') {
      throw new ApplicationException({
        code: 'COURT_NOT_FOUND',
        messageKey: 'error.courtNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (court.type !== booking.requestedCourtType) {
      throw new ApplicationException({
        code: 'COURT_TYPE_MISMATCH',
        messageKey: 'error.courtTypeMismatch',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await this.dataSource.transaction(async (em) => {
      // 1. Pessimistic lock check on confirmed bookings for this court and overlapping time
      const conflictingBooking = await em
        .createQueryBuilder(BookingEntity, 'b')
        .setLock('pessimistic_write')
        .where('b.fieldCourtId = :courtId', { courtId: dto.fieldCourtId })
        .andWhere('b.bookingDate = :bookingDate', {
          bookingDate: booking.bookingDate,
        })
        .andWhere('b.status = :confirmedStatus', {
          confirmedStatus: 'confirmed',
        })
        .andWhere('b.id != :bookingId', { bookingId: booking.id })
        .andWhere('b.startTime < :endTime', { endTime: booking.endTime })
        .andWhere('b.endTime > :startTime', { startTime: booking.startTime })
        .getOne();

      if (conflictingBooking) {
        throw new ApplicationException({
          code: 'COURT_ALREADY_OCCUPIED',
          messageKey: 'error.courtAlreadyOccupied',
          status: HttpStatus.CONFLICT,
        });
      }

      // 2. Check blocked slots for this court
      const blockedOverlap = await em
        .createQueryBuilder(FieldBlockedSlotEntity, 's')
        .where('s.fieldCourtId = :courtId', { courtId: dto.fieldCourtId })
        .andWhere('s.blockedDate = :blockedDate', {
          blockedDate: booking.bookingDate,
        })
        .andWhere('s.startTime < :endTime', { endTime: booking.endTime })
        .andWhere('s.endTime > :startTime', { startTime: booking.startTime })
        .getOne();

      if (blockedOverlap) {
        throw new ApplicationException({
          code: 'COURT_ALREADY_OCCUPIED',
          messageKey: 'error.courtAlreadyOccupied',
          status: HttpStatus.CONFLICT,
        });
      }

      booking.fieldCourtId = dto.fieldCourtId;
      if (dto.note) {
        booking.ownerNote = dto.note;
      }

      await this.stateMachineService.transitionStatus(
        em,
        booking,
        'confirmed',
        ownerUserId,
        'owner',
        dto.note,
      );
    });

    const updated = await this.bookingRepository.findDetailById(bookingId);
    return BookingResponseDto.fromEntity(updated!);
  }

  async rejectBooking(
    fieldId: string,
    bookingId: string,
    ownerUserId: string,
    dto: RejectBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.fieldId !== fieldId) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (booking.status !== 'pending') {
      throw new ApplicationException({
        code: 'INVALID_BOOKING_STATUS_TRANSITION',
        messageKey: 'error.invalidBookingStatusTransition',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await this.dataSource.transaction(async (em) => {
      booking.ownerNote = dto.reason;
      await this.stateMachineService.transitionStatus(
        em,
        booking,
        'rejected',
        ownerUserId,
        'owner',
        dto.reason,
      );
    });

    const updated = await this.bookingRepository.findDetailById(bookingId);
    return BookingResponseDto.fromEntity(updated!);
  }

  async cancelBooking(
    fieldId: string,
    bookingId: string,
    ownerUserId: string,
    dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.fieldId !== fieldId) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      throw new ApplicationException({
        code: 'BOOKING_CANNOT_BE_CANCELLED',
        messageKey: 'error.bookingCannotBeCancelled',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await this.dataSource.transaction(async (em) => {
      booking.cancelledBy = ownerUserId;
      booking.cancelReason = dto.reason;
      await this.stateMachineService.transitionStatus(
        em,
        booking,
        'cancelled',
        ownerUserId,
        'owner',
        dto.reason,
      );
    });

    const updated = await this.bookingRepository.findDetailById(bookingId);
    return BookingResponseDto.fromEntity(updated!);
  }

  async completeBooking(
    fieldId: string,
    bookingId: string,
    ownerUserId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.fieldId !== fieldId) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (booking.status !== 'confirmed') {
      throw new ApplicationException({
        code: 'INVALID_BOOKING_STATUS_TRANSITION',
        messageKey: 'error.invalidBookingStatusTransition',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await this.dataSource.transaction(async (em) => {
      await this.stateMachineService.transitionStatus(
        em,
        booking,
        'completed',
        ownerUserId,
        'owner',
        'Hoàn tất trận đấu',
      );
    });

    const updated = await this.bookingRepository.findDetailById(bookingId);
    return BookingResponseDto.fromEntity(updated!);
  }
}
