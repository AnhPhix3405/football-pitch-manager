import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { BookingRepository } from '~/repositories/booking.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { TransactionRepository } from '~/repositories/transaction.repository';
import {
  TransactionStatus,
  TransactionType,
} from '../constants/payment.constant';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { RefundResponseDto } from '../dto/refund-response.dto';

@Injectable()
export class RefundService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly ownerProfileRepository: OwnerProfileRepository,
  ) {}

  async processRefund(
    bookingId: string,
    actorUserId: string,
    actorRole: string,
    dto: RefundPaymentDto,
  ): Promise<RefundResponseDto> {
    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    // Role check: Admin can refund any booking. Owner can only refund bookings on their fields.
    if (actorRole !== 'admin') {
      const ownerProfile =
        await this.ownerProfileRepository.findByUserId(actorUserId);
      if (
        !booking.field ||
        (booking.field.ownerId !== actorUserId &&
          (!ownerProfile || booking.field.ownerId !== ownerProfile.id))
      ) {
        throw new ApplicationException({
          code: 'FORBIDDEN_FIELD_ACCESS',
          messageKey: 'error.forbiddenFieldAccess',
          status: HttpStatus.FORBIDDEN,
        });
      }
    }

    // Eligibility check
    if (booking.paymentStatus === 'refunded') {
      throw new ApplicationException({
        code: 'BOOKING_ALREADY_REFUNDED',
        messageKey: 'error.bookingAlreadyRefunded',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (booking.paymentStatus !== 'paid') {
      throw new ApplicationException({
        code: 'BOOKING_CANNOT_BE_REFUNDED',
        messageKey: 'error.bookingCannotBeRefunded',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (!['cancelled', 'rejected'].includes(booking.status)) {
      throw new ApplicationException({
        code: 'BOOKING_CANNOT_BE_REFUNDED',
        messageKey: 'error.bookingCannotBeRefunded',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const originalTx = await this.transactionRepository.findByRefIdAndType(
      bookingId,
      TransactionType.BOOKING_DEPOSIT,
    );

    const refundAmount = dto.amount
      ? dto.amount.toFixed(2)
      : originalTx?.amount || booking.depositAmount || booking.totalPrice;

    // Create refund transaction
    const refundTx = await this.transactionRepository.createTransaction({
      userId: booking.userId,
      refId: bookingId,
      type: TransactionType.REFUND,
      amount: refundAmount,
      status: TransactionStatus.SUCCESS,
      gateway: originalTx?.gateway || booking.paymentMethod || 'cash',
      gatewayRef: originalTx?.gatewayRef || null,
    });

    // Update booking paymentStatus
    booking.paymentStatus = 'refunded';
    if (dto.reason) {
      booking.cancelReason = dto.reason;
    }
    await this.bookingRepository.save(booking);

    const response = new RefundResponseDto();
    response.refundTransactionId = refundTx.id;
    response.bookingId = bookingId;
    response.refundAmount = refundAmount;
    response.paymentStatus = booking.paymentStatus;
    response.transactionStatus = refundTx.status;
    response.reason = dto.reason || null;
    response.createdAt = refundTx.createdAt;

    return response;
  }
}
