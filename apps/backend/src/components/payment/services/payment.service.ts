import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { BookingRepository } from '~/repositories/booking.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { TransactionRepository } from '~/repositories/transaction.repository';
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../constants/payment.constant';
import { ConfirmCashPaymentDto } from '../dto/confirm-cash-payment.dto';
import { CreateVnpayUrlDto } from '../dto/create-vnpay-url.dto';
import { PaymentTransactionResponseDto } from '../dto/payment-transaction-response.dto';
import { SelectPaymentMethodDto } from '../dto/select-payment-method.dto';
import { VnpayUrlResponseDto } from '../dto/vnpay-url-response.dto';
import { VnpayService } from './vnpay.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly ownerProfileRepository: OwnerProfileRepository,
    private readonly vnpayService: VnpayService,
  ) {}

  async selectPaymentMethod(
    bookingId: string,
    userId: string,
    dto: SelectPaymentMethodDto,
  ): Promise<PaymentTransactionResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (booking.userId !== userId) {
      throw new ApplicationException({
        code: 'FORBIDDEN_ACCESS',
        messageKey: 'error.forbiddenRole',
        status: HttpStatus.FORBIDDEN,
      });
    }

    if (booking.paymentStatus === 'paid') {
      throw new ApplicationException({
        code: 'BOOKING_ALREADY_PAID',
        messageKey: 'error.bookingAlreadyPaid',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (['rejected', 'cancelled', 'completed'].includes(booking.status)) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_ELIGIBLE_FOR_PAYMENT',
        messageKey: 'error.bookingNotEligibleForPayment',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    booking.paymentMethod = dto.method;
    booking.paymentStatus = 'pending';
    await this.bookingRepository.save(booking);

    const requiredAmount =
      booking.depositAmount && Number(booking.depositAmount) > 0
        ? booking.depositAmount
        : booking.totalPrice;

    let transaction = await this.transactionRepository.findByRefIdAndType(
      bookingId,
      TransactionType.BOOKING_DEPOSIT,
    );

    if (transaction) {
      transaction.gateway = dto.method;
      transaction.amount = requiredAmount;
      transaction.status = TransactionStatus.PENDING;
      transaction = await this.transactionRepository.save(transaction);
    } else {
      transaction = await this.transactionRepository.createTransaction({
        userId,
        refId: bookingId,
        type: TransactionType.BOOKING_DEPOSIT,
        amount: requiredAmount,
        status: TransactionStatus.PENDING,
        gateway: dto.method,
      });
    }

    return PaymentTransactionResponseDto.fromEntity(transaction);
  }

  async createVnpayUrl(
    userId: string,
    dto: CreateVnpayUrlDto,
    ipAddr: string,
  ): Promise<VnpayUrlResponseDto> {
    const txDto = await this.selectPaymentMethod(dto.bookingId, userId, {
      method: PaymentMethod.VNPAY,
    });

    const paymentUrl = this.vnpayService.createPaymentUrl({
      amount: Number(txDto.amount),
      orderInfo: dto.orderInfo || `Thanh toan don dat san ${dto.bookingId}`,
      txnRef: txDto.id,
      ipAddr,
    });

    const response = new VnpayUrlResponseDto();
    response.paymentUrl = paymentUrl;
    response.txnRef = txDto.id;
    return response;
  }

  async confirmCashPayment(
    bookingId: string,
    ownerUserId: string,
    dto?: ConfirmCashPaymentDto,
  ): Promise<PaymentTransactionResponseDto> {
    const ownerProfile =
      await this.ownerProfileRepository.findByUserId(ownerUserId);
    if (!ownerProfile) {
      throw new ApplicationException({
        code: 'OWNER_PROFILE_NOT_FOUND',
        messageKey: 'error.ownerProfileNotFound',
        status: HttpStatus.FORBIDDEN,
      });
    }

    const booking = await this.bookingRepository.findDetailById(bookingId);
    if (!booking) {
      throw new ApplicationException({
        code: 'BOOKING_NOT_FOUND',
        messageKey: 'error.bookingNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (
      !booking.field ||
      (booking.field.ownerId !== ownerUserId &&
        booking.field.ownerId !== ownerProfile.id)
    ) {
      throw new ApplicationException({
        code: 'FORBIDDEN_FIELD_ACCESS',
        messageKey: 'error.forbiddenFieldAccess',
        status: HttpStatus.FORBIDDEN,
      });
    }

    if (booking.paymentStatus === 'paid') {
      throw new ApplicationException({
        code: 'BOOKING_ALREADY_PAID',
        messageKey: 'error.bookingAlreadyPaid',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = PaymentMethod.CASH;
    if (dto?.note) {
      booking.ownerNote = dto.note;
    }
    await this.bookingRepository.save(booking);

    let transaction = await this.transactionRepository.findByRefIdAndType(
      bookingId,
      TransactionType.BOOKING_DEPOSIT,
    );

    const requiredAmount =
      booking.depositAmount && Number(booking.depositAmount) > 0
        ? booking.depositAmount
        : booking.totalPrice;

    if (transaction) {
      transaction.status = TransactionStatus.SUCCESS;
      transaction.gateway = PaymentMethod.CASH;
      transaction = await this.transactionRepository.save(transaction);
    } else {
      transaction = await this.transactionRepository.createTransaction({
        userId: booking.userId,
        refId: bookingId,
        type: TransactionType.BOOKING_DEPOSIT,
        amount: requiredAmount,
        status: TransactionStatus.SUCCESS,
        gateway: PaymentMethod.CASH,
      });
    }

    return PaymentTransactionResponseDto.fromEntity(transaction);
  }
}
