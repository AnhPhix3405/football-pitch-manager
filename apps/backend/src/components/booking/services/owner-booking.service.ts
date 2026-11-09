import { FieldCourtEntity } from '~/entities/field-court.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { NotificationService } from '~/components/notification/services/notification.service';
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
    private readonly notificationService: NotificationService,
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
      const current = await em.findOne(BookingEntity, {
        where: { id: booking.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !current ||
        current.status !== 'pending' ||
        (current.paymentOptions &&
          (!current.paymentMethod ||
            (current.paymentMethod === 'vnpay' &&
              !['paid', 'partially_paid'].includes(current.paymentStatus))))
      ) {
        throw new ApplicationException({
          code: 'BOOKING_NOT_ELIGIBLE_FOR_PAYMENT',
          messageKey: 'error.bookingNotEligibleForPayment',
          status: HttpStatus.CONFLICT,
        });
      }
      await em.findOneOrFail(FieldCourtEntity, {
        where: { id: court.id, status: 'active' },
        lock: { mode: 'pessimistic_write' },
      });
      // 1. Pessimistic lock check on confirmed bookings for this court and overlapping time
      const conflictingBooking = await em
        .createQueryBuilder(BookingEntity, 'b')
        .setLock('pessimistic_write')
        .where('b.fieldCourtId = :courtId', { courtId: dto.fieldCourtId })
        .andWhere('b.bookingDate = :bookingDate', {
          bookingDate: booking.bookingDate,
        })
        .andWhere(
          "(b.status IN ('confirmed', 'completed') OR (b.status = 'pending' AND (b.paymentHoldUntil > now() OR b.paidAmount > 0)))",
        )
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

      current.fieldCourtId = dto.fieldCourtId;
      if (dto.note) {
        current.ownerNote = dto.note;
      }

      await this.stateMachineService.transitionStatus(
        em,
        current,
        'confirmed',
        ownerUserId,
        'owner',
        dto.note,
      );
    });

    try {
      await this.notificationService.createAndSend({
        userId: booking.userId,
        type: 'booking_confirmed',
        title: 'Đơn đặt sân đã được xác nhận',
        content: `Đơn đặt #${booking.id.slice(0, 8).toUpperCase()} tại sân ${booking.field?.name || 'bóng'} đã được chủ sân xác nhận thành công. Sân thi đấu: ${court.name}.`,
        refId: booking.id,
        link: `/bookings/${booking.id}`,
      });
    } catch {
      // Best-effort notification delivery
    }

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

    try {
      await this.notificationService.createAndSend({
        userId: booking.userId,
        type: 'booking_rejected',
        title: 'Đơn đặt sân đã bị từ chối',
        content: `Đơn đặt #${booking.id.slice(0, 8).toUpperCase()} tại sân ${booking.field?.name || 'bóng'} đã bị từ chối. Lý do: "${dto.reason}". Vui lòng liên hệ với chủ sân để hoàn cọc.`,
        refId: booking.fieldId,
        link: `/messages?fieldId=${booking.fieldId}`,
      });
    } catch {
      // Best-effort notification delivery
    }

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

    try {
      await this.notificationService.createAndSend({
        userId: booking.userId,
        type: 'booking_cancelled',
        title: 'Đơn đặt sân đã bị hủy bởi chủ sân',
        content: `Đơn đặt #${booking.id.slice(0, 8).toUpperCase()} tại sân ${booking.field?.name || 'bóng'} đã bị chủ sân hủy. Lý do: "${dto.reason}". Vui lòng liên hệ với chủ sân để được hỗ trợ hoàn cọc.`,
        refId: booking.fieldId,
        link: `/messages?fieldId=${booking.fieldId}`,
      });
    } catch {
      // Best-effort notification delivery
    }

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
