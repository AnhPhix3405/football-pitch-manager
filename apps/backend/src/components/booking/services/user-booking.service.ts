import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldAvailabilityService } from '~/components/field/services/field-availability.service';
import { FieldPricingCalculatorService } from '~/components/field/services/field-pricing-calculator.service';
import { NotificationService } from '~/components/notification/services/notification.service';
import { BookingServiceEntity } from '~/entities/booking-service.entity';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldServiceEntity } from '~/entities/field-service.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { CancellationPreviewResponseDto } from '../dto/cancellation-preview-response.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UserBookingQueryDto } from '../dto/user-booking-query.dto';
import { BookingStateMachineService } from './booking-state-machine.service';

@Injectable()
export class UserBookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly fieldRepository: FieldRepository,
    private readonly openingHourRepository: FieldOpeningHourRepository,
    private readonly fieldServiceRepository: FieldServiceRepository,
    private readonly pricingCalculatorService: FieldPricingCalculatorService,
    private readonly availabilityService: FieldAvailabilityService,
    private readonly stateMachineService: BookingStateMachineService,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async createBooking(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    if (dto.startTime >= dto.endTime) {
      throw new ApplicationException({
        code: 'INVALID_TIME_RANGE',
        messageKey: 'error.invalidTimeRange',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const field = await this.fieldRepository.findById(dto.fieldId);
    if (!field || field.status !== 'active') {
      throw new ApplicationException({
        code: 'FIELD_NOT_FOUND',
        messageKey: 'error.fieldNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const dayOfWeek = new Date(dto.bookingDate + 'T00:00:00Z').getUTCDay();
    const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    const openingHour = await this.openingHourRepository.findByFieldAndDay(
      dto.fieldId,
      adjustedDayOfWeek,
    );

    if (
      !openingHour ||
      openingHour.isClosed ||
      !openingHour.openTime ||
      !openingHour.closeTime ||
      dto.startTime < openingHour.openTime.slice(0, 5) ||
      dto.endTime > openingHour.closeTime.slice(0, 5)
    ) {
      throw new ApplicationException({
        code: 'OUTSIDE_OPENING_HOURS',
        messageKey: 'error.outsideOpeningHours',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const availability =
      await this.availabilityService.checkCourtTypeAvailability(dto.fieldId, {
        courtType: dto.courtType,
        date: dto.bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
      });

    const courtTypeAvail = availability.courtTypes.find(
      (ct) => ct.courtType === dto.courtType,
    );

    if (
      !courtTypeAvail ||
      !courtTypeAvail.isAvailable ||
      courtTypeAvail.availableCourts === 0
    ) {
      throw new ApplicationException({
        code: 'COURT_UNAVAILABLE',
        messageKey: 'error.courtUnavailable',
        status: HttpStatus.CONFLICT,
      });
    }

    const quote = await this.pricingCalculatorService.calculateQuote(
      dto.fieldId,
      {
        courtType: dto.courtType,
        date: dto.bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    );
    const pitchPrice = quote.totalPrice;

    let servicesTotal = 0;
    const serviceMap = new Map<string, FieldServiceEntity>();
    if (dto.services && dto.services.length > 0) {
      const activeFieldServices =
        await this.fieldServiceRepository.findByFieldId(dto.fieldId, true);
      activeFieldServices.forEach((s) => serviceMap.set(s.id, s));

      for (const item of dto.services) {
        const s = serviceMap.get(item.serviceId);
        if (!s) {
          throw new ApplicationException({
            code: 'SERVICE_NOT_BELONG_TO_FIELD',
            messageKey: 'error.serviceNotBelongToField',
            status: HttpStatus.BAD_REQUEST,
          });
        }
        servicesTotal += item.quantity * Number(s.price);
      }
    }

    const totalPrice = pitchPrice + servicesTotal;
    const configuredDeposit = Number(field.depositValue ?? 0);
    const depositAmount = field.requireDeposit
      ? Math.min(
          totalPrice,
          field.depositType === 'percentage'
            ? Math.round((totalPrice * configuredDeposit) / 100)
            : configuredDeposit,
        )
      : 0;

    const bookingId = randomUUID();

    const notification = await this.dataSource.transaction(async (em) => {
      const bookingEntity = em.create(BookingEntity, {
        id: bookingId,
        userId,
        fieldId: dto.fieldId,
        requestedCourtType: dto.courtType,
        fieldCourtId: null,
        bookingDate: dto.bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: 'pending',
        totalPrice: totalPrice.toString(),
        depositAmount: depositAmount.toString(),
        paymentStatus: 'unpaid',
        paymentOptions: field.paymentOptions ?? ['cash'],
        paidAmount: '0',
        paymentMethod: null,
        ownerNote: null,
        cancelledBy: null,
        cancelReason: null,
        version: 1,
      });

      await em.save(BookingEntity, bookingEntity);

      if (dto.services && dto.services.length > 0) {
        const bookingServices = dto.services.map((item) => {
          const s = serviceMap.get(item.serviceId)!;
          return em.create(BookingServiceEntity, {
            id: randomUUID(),
            bookingId,
            serviceId: item.serviceId,
            quantity: item.quantity,
            priceSnapshot: s.price.toString(),
          });
        });
        await em.save(BookingServiceEntity, bookingServices);
      }

      await this.stateMachineService.recordInitialStatus(em, bookingId, userId);
      return this.notificationService.recordOwnerNotification(em, {
        userId: field.ownerId,
        type: 'booking_new',
        fieldName: field.name,
        refId: bookingId,
      });
    });
    this.notificationService.publish(field.ownerId, notification);

    const fullDetail = await this.bookingRepository.findDetailById(bookingId);
    return BookingResponseDto.fromEntity(fullDetail!);
  }

  async getMyBookings(
    userId: string,
    query: UserBookingQueryDto,
  ): Promise<{
    data: BookingResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [list, total] = await this.bookingRepository.findUserBookings(
      userId,
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
    userId: string,
    bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return BookingResponseDto.fromEntity(booking);
  }

  private computeCancellationPolicy(booking: BookingEntity): {
    hoursUntilMatch: number;
    canCancel: boolean;
    penaltyPercentage: number;
    depositAmount: number;
    penaltyAmount: number;
    refundAmount: number;
    policyDescription: string;
    blockReason?: string;
  } {
    const dateStr =
      typeof booking.bookingDate === 'string'
        ? booking.bookingDate
        : (booking.bookingDate as unknown as Date).toISOString().slice(0, 10);
    const timeStr = booking.startTime ? booking.startTime.slice(0, 5) : '00:00';
    const matchDateTime = new Date(`${dateStr}T${timeStr}:00`);

    const now = new Date();
    const diffMs = matchDateTime.getTime() - now.getTime();
    const hoursUntilMatch = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    const depositAmount = Number(booking.depositAmount) || 0;

    if (hoursUntilMatch <= 0) {
      return {
        hoursUntilMatch,
        canCancel: false,
        penaltyPercentage: 100,
        depositAmount,
        penaltyAmount: depositAmount,
        refundAmount: 0,
        policyDescription:
          'Trận đấu đã diễn ra hoặc quá giờ bắt đầu, không thể hủy lịch.',
        blockReason:
          'Trận đấu đã bắt đầu hoặc kết thúc, không thể thực hiện hủy lịch đặt.',
      };
    }

    if (hoursUntilMatch >= 24) {
      return {
        hoursUntilMatch,
        canCancel: true,
        penaltyPercentage: 0,
        depositAmount,
        penaltyAmount: 0,
        refundAmount: depositAmount,
        policyDescription:
          'Hủy trước 24 giờ so với giờ thi đấu: Miễn phí hủy, hoàn 100% tiền đặt cọc.',
      };
    }

    if (hoursUntilMatch >= 12) {
      const penaltyAmount = Math.round(depositAmount * 0.5);
      const refundAmount = depositAmount - penaltyAmount;
      return {
        hoursUntilMatch,
        canCancel: true,
        penaltyPercentage: 50,
        depositAmount,
        penaltyAmount,
        refundAmount,
        policyDescription:
          'Hủy trong vòng 12 - 24 giờ trước trận: Phạt 50% tiền cọc, hoàn lại 50% tiền cọc.',
      };
    }

    return {
      hoursUntilMatch,
      canCancel: true,
      penaltyPercentage: 100,
      depositAmount,
      penaltyAmount: depositAmount,
      refundAmount: 0,
      policyDescription:
        'Hủy dưới 12 giờ trước giờ thi đấu: Mất 100% tiền đặt cọc (không hoàn cọc).',
    };
  }

  async getCancellationPreview(
    userId: string,
    bookingId: string,
  ): Promise<CancellationPreviewResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.userId !== userId) {
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

    const policy = this.computeCancellationPolicy(booking);
    return {
      bookingId: booking.id,
      ...policy,
    };
  }

  async cancelMyBooking(
    userId: string,
    bookingId: string,
    dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking || booking.userId !== userId) {
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

    const policy = this.computeCancellationPolicy(booking);
    if (!policy.canCancel) {
      throw new ApplicationException({
        code: 'MATCH_ALREADY_STARTED',
        messageKey: 'error.matchAlreadyStarted',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const formattedReason = `[Phạt cọc: ${policy.penaltyAmount.toLocaleString('vi-VN')}đ | Hoàn cọc: ${policy.refundAmount.toLocaleString('vi-VN')}đ] ${dto.reason}`;

    await this.dataSource.transaction(async (em) => {
      booking.cancelledBy = userId;
      booking.cancelReason = formattedReason;

      if (
        !booking.paymentOptions &&
        (booking.paymentStatus === 'paid' ||
          booking.paymentStatus === 'partially_paid')
      ) {
        if (policy.refundAmount === 0) {
          booking.paymentStatus = 'penalty_deducted';
        } else if (policy.penaltyAmount === 0) {
          booking.paymentStatus = 'refunded';
        } else {
          booking.paymentStatus = 'partially_refunded';
        }
      }

      await this.stateMachineService.transitionStatus(
        em,
        booking,
        'cancelled',
        userId,
        'user',
        formattedReason,
      );
    });

    try {
      await this.notificationService.createAndSend({
        userId,
        type: 'booking_cancelled',
        title: 'Hủy đặt sân thành công',
        content: `Đơn đặt sân ${booking.id.slice(0, 8).toUpperCase()} đã được hủy. Số tiền hoàn cọc dự kiến: ${policy.refundAmount.toLocaleString('vi-VN')}đ.`,
        link: `/bookings/${booking.id}`,
      });

      if (booking.field?.ownerId) {
        await this.notificationService.createAndSend({
          userId: booking.field.ownerId,
          type: 'booking_cancelled',
          title: 'Khách hàng hủy đơn đặt sân',
          content: `Đơn đặt ${booking.id.slice(0, 8).toUpperCase()} ngày ${booking.bookingDate} (${booking.startTime}) đã bị hủy. Phạt cọc ghi nhận: ${policy.penaltyAmount.toLocaleString('vi-VN')}đ.`,
          link: '/owner',
        });
      }
    } catch {
      // Best-effort notification delivery
    }

    const updated = await this.bookingRepository.findDetailById(bookingId);
    return BookingResponseDto.fromEntity(updated!);
  }
}
