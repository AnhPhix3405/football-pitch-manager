import { NotificationService } from '~/components/notification/services/notification.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldEntity } from '~/entities/field.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import { TransactionEntity } from '~/entities/transaction.entity';
import {
  BookingPaymentOption,
  PAYMENT_HOLD_MS,
  PaymentMethod,
  TransactionStatus,
  TransactionType,
  VnpayResponseCode,
} from '../constants/payment.constant';
import { PaymentTransactionResponseDto } from '../dto/payment-transaction-response.dto';
import { CreateVnpayUrlDto } from '../dto/create-vnpay-url.dto';
import type { VnpayCallbackQueryDto } from '../dto/vnpay-callback-query.dto';
import { OwnerPaymentSettingsService } from './owner-payment-settings.service';
import { VnpayService } from './vnpay.service';

@Injectable()
export class ManagedBookingPaymentService {
  constructor(
    private readonly db: DataSource,
    private readonly settings: OwnerPaymentSettingsService,
    private readonly vnpay: VnpayService,
    private readonly notifications: NotificationService,
  ) {}

  private lockBooking(manager: EntityManager, id: string) {
    return manager.findOne(BookingEntity, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  private async loadBooking(manager: EntityManager, id: string) {
    const booking = await this.lockBooking(manager, id);
    if (!booking)
      throw new NotFoundException({ messageKey: 'error.bookingNotFound' });
    if (['cancelled', 'rejected'].includes(booking.status))
      throw new BadRequestException({
        messageKey: 'error.bookingNotEligibleForPayment',
      });
    return booking;
  }

  private pendingOnline(manager: EntityManager, bookingId: string) {
    return manager.findOneBy(TransactionEntity, {
      refId: bookingId,
      gateway: PaymentMethod.VNPAY,
      status: TransactionStatus.PENDING,
    });
  }

  private async reserveCourt(manager: EntityManager, booking: BookingEntity) {
    const courts = await manager.find(FieldCourtEntity, {
      where: {
        fieldId: booking.fieldId,
        status: 'active',
        type: booking.requestedCourtType,
      },
      order: { id: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });
    for (const court of courts) {
      if (booking.status === 'confirmed' && booking.fieldCourtId !== court.id)
        continue;
      const params = {
        court: court.id,
        date: booking.bookingDate,
        id: booking.id,
        start: booking.startTime,
        end: booking.endTime,
      };
      const booked = await manager
        .getRepository(BookingEntity)
        .createQueryBuilder('b')
        .where(
          'b.fieldCourtId = :court AND b.bookingDate = :date AND b.id <> :id',
          params,
        )
        .andWhere('b.startTime < :end AND b.endTime > :start', params)
        .andWhere(
          "(b.status IN ('confirmed', 'completed') OR (b.status = 'pending' AND (b.paymentHoldUntil > now() OR b.paidAmount > 0)))",
        )
        .getExists();
      if (booked) continue;
      const blocked = await manager
        .getRepository(FieldBlockedSlotEntity)
        .createQueryBuilder('s')
        .where('s.fieldCourtId = :court AND s.blockedDate = :date', params)
        .andWhere('s.startTime < :end AND s.endTime > :start', params)
        .getExists();
      if (!blocked) return court.id;
    }
    throw new ConflictException({ messageKey: 'error.courtUnavailable' });
  }

  async createVnpayUrl(userId: string, dto: CreateVnpayUrlDto, ipAddr: string) {
    return this.db.transaction(async (manager) => {
      const booking = await this.loadBooking(manager, dto.bookingId);
      if (booking.userId !== userId)
        throw new ForbiddenException({ messageKey: 'error.forbiddenRole' });
      if (
        booking.status === 'completed' ||
        Number(booking.paidAmount) > 0 ||
        booking.paymentStatus === 'paid'
      ) {
        throw new BadRequestException({
          messageKey: 'error.bookingNotEligibleForPayment',
        });
      }
      const options = booking.paymentOptions ?? [];
      const option =
        dto.option ??
        (options.includes(BookingPaymentOption.DEPOSIT)
          ? BookingPaymentOption.DEPOSIT
          : BookingPaymentOption.FULL);
      if (!options.includes(option))
        throw new BadRequestException({
          messageKey: 'error.paymentOptionUnavailable',
        });
      const type =
        option === BookingPaymentOption.DEPOSIT
          ? TransactionType.BOOKING_DEPOSIT
          : TransactionType.BOOKING_FULL;
      const pending = await this.pendingOnline(manager, booking.id);
      if (pending) {
        if (
          pending.type !== String(type) ||
          !pending.merchantId ||
          !pending.expiresAt ||
          pending.expiresAt <= new Date()
        ) {
          throw new ConflictException({
            messageKey: 'error.paymentAwaitingReconciliation',
          });
        }
        return this.paymentLink(pending, ipAddr, manager);
      }
      const field = await manager.findOneBy(FieldEntity, {
        id: booking.fieldId,
        status: 'active',
      });
      if (!field)
        throw new NotFoundException({ messageKey: 'error.fieldNotFound' });
      const merchant = await this.settings.latestMerchant(
        field.ownerId,
        manager,
      );
      if (!merchant)
        throw new BadRequestException({
          messageKey: 'error.merchantConfigurationRequired',
        });
      const amount =
        option === BookingPaymentOption.DEPOSIT
          ? Number(booking.depositAmount)
          : Number(booking.totalPrice);
      if (!Number.isSafeInteger(amount) || amount < 5000)
        throw new BadRequestException({
          messageKey: 'error.invalidOnlinePaymentAmount',
        });
      const startsAt = Date.parse(
        `${booking.bookingDate}T${booking.startTime.slice(0, 5)}:00+07:00`,
      );
      if (!Number.isFinite(startsAt) || startsAt <= Date.now()) {
        throw new BadRequestException({
          messageKey: 'error.bookingNotEligibleForPayment',
        });
      }
      const expiresAt = new Date(
        Math.min(Date.now() + PAYMENT_HOLD_MS, startsAt),
      );
      booking.fieldCourtId = await this.reserveCourt(manager, booking);
      booking.paymentHoldUntil = expiresAt;
      booking.paymentStatus = 'pending';
      booking.paymentMethod = PaymentMethod.VNPAY;
      await manager.save(BookingEntity, booking);
      const tx = await manager.save(
        TransactionEntity,
        manager.create(TransactionEntity, {
          id: randomUUID(),
          userId,
          refId: booking.id,
          type,
          amount: String(amount),
          status: TransactionStatus.PENDING,
          gateway: PaymentMethod.VNPAY,
          merchantId: merchant.id,
          expiresAt,
        }),
      );
      return this.paymentLink(tx, ipAddr, manager);
    });
  }

  private async paymentLink(
    transaction: TransactionEntity,
    ipAddr: string,
    manager: EntityManager,
  ) {
    const merchant = await this.settings.credentials(
      transaction.merchantId!,
      manager,
    );
    const paymentUrl = this.vnpay.createPaymentUrl({
      merchant,
      ipAddr,
      txnRef: transaction.id,
      amount: Number(transaction.amount),
      expiresAt: transaction.expiresAt!,
      createdAt: transaction.createdAt,
      orderInfo: `Thanh toan dat san ${transaction.refId}`,
    });
    return { paymentUrl, txnRef: transaction.id };
  }

  async processIpn(
    transaction: TransactionEntity,
    query: VnpayCallbackQueryDto,
  ) {
    const merchant = await this.settings.credentials(transaction.merchantId!);
    if (!this.vnpay.verifySecureHash(query, merchant)) {
      return {
        RspCode: VnpayResponseCode.INVALID_CHECKSUM,
        Message: 'Invalid Checksum',
      };
    }
    if (
      !/^\d+$/.test(query.vnp_Amount ?? '') ||
      Number(query.vnp_Amount) !== Math.round(Number(transaction.amount) * 100)
    ) {
      return {
        RspCode: VnpayResponseCode.INVALID_AMOUNT,
        Message: 'Invalid Amount',
      };
    }
    const result = await this.db.transaction(async (manager) => {
      const booking = await this.lockBooking(manager, transaction.refId);
      if (!booking)
        return {
          RspCode: VnpayResponseCode.ORDER_NOT_FOUND,
          Message: 'Order not found',
        };
      const current = await manager.findOneByOrFail(TransactionEntity, {
        id: transaction.id,
      });
      if (current.status !== 'pending') {
        return {
          RspCode: VnpayResponseCode.ORDER_ALREADY_CONFIRMED,
          Message: 'Order already confirmed',
        };
      }
      const success =
        query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00';
      current.status = success
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILED;
      current.gatewayRef = query.vnp_TransactionNo ?? null;
      await manager.save(TransactionEntity, current);

      if (success) {
        const paid = Number(booking.paidAmount) + Number(current.amount);
        booking.paidAmount = paid.toFixed(2);
        booking.paymentStatus =
          paid >= Number(booking.totalPrice) ? 'paid' : 'partially_paid';
      } else if (booking.paymentStatus === 'pending') {
        booking.paymentStatus = 'failed';
      }
      if (
        booking.status === 'pending' &&
        (!success ||
          !booking.paymentHoldUntil ||
          booking.paymentHoldUntil <= new Date())
      ) {
        booking.fieldCourtId = null;
      }
      booking.paymentHoldUntil = null;
      await manager.save(BookingEntity, booking);
      const field = success
        ? await manager.findOneBy(FieldEntity, { id: booking.fieldId })
        : null;
      const notification = field
        ? await this.notifications.recordOwnerNotification(manager, {
            userId: field.ownerId,
            type: 'booking_deposit_paid',
            fieldName: field.name,
            refId: booking.id,
          })
        : null;
      return {
        RspCode: VnpayResponseCode.SUCCESS,
        Message: 'Confirm Success',
        notification,
        ownerId: field?.ownerId,
      };
    });
    if (result.ownerId && result.notification) {
      this.notifications.publish(result.ownerId, result.notification);
    }
    return { RspCode: result.RspCode, Message: result.Message };
  }

  async returnStatus(
    transaction: TransactionEntity,
    query: VnpayCallbackQueryDto,
  ) {
    const merchant = await this.settings.credentials(transaction.merchantId!);
    const isValid = this.vnpay.verifySecureHash(query, merchant);
    const isSuccess = isValid && transaction.status === 'success';
    return {
      isValid,
      isSuccess,
      txnRef: transaction.id,
      transactionNo: transaction.gatewayRef,
      amount: Number(transaction.amount),
      bankCode: query.vnp_BankCode,
      status: isValid ? transaction.status : 'failed',
    };
  }

  async chooseCash(bookingId: string, userId: string) {
    return this.db.transaction(async (manager) => {
      const booking = await this.loadBooking(manager, bookingId);
      if (booking.userId !== userId)
        throw new ForbiddenException({ messageKey: 'error.forbiddenRole' });
      if (
        booking.status === 'completed' ||
        booking.paymentStatus === 'paid' ||
        !booking.paymentOptions?.includes(BookingPaymentOption.CASH)
      ) {
        throw new BadRequestException({
          messageKey: 'error.paymentOptionUnavailable',
        });
      }
      if (await this.pendingOnline(manager, booking.id))
        throw new ConflictException({
          messageKey: 'error.paymentAwaitingReconciliation',
        });
      booking.paymentMethod = PaymentMethod.CASH;
      await manager.save(BookingEntity, booking);
      return { method: PaymentMethod.CASH };
    });
  }

  async confirmCash(bookingId: string, ownerId: string, note?: string) {
    return this.db.transaction(async (manager) => {
      const booking = await this.loadBooking(manager, bookingId);
      const field = await manager.findOneBy(FieldEntity, {
        id: booking.fieldId,
      });
      if (field?.ownerId !== ownerId)
        throw new ForbiddenException({
          messageKey: 'error.forbiddenFieldAccess',
        });
      if (await this.pendingOnline(manager, booking.id))
        throw new ConflictException({
          messageKey: 'error.paymentAwaitingReconciliation',
        });
      const paid = Number(booking.paidAmount);
      if (
        !paid &&
        (!booking.paymentOptions?.includes(BookingPaymentOption.CASH) ||
          booking.paymentMethod !== PaymentMethod.CASH)
      ) {
        throw new BadRequestException({
          messageKey: 'error.paymentOptionUnavailable',
        });
      }
      const remaining =
        Math.round((Number(booking.totalPrice) - paid) * 100) / 100;
      if (remaining <= 0)
        throw new BadRequestException({
          messageKey: 'error.bookingAlreadyPaid',
        });
      const tx = await manager.save(
        TransactionEntity,
        manager.create(TransactionEntity, {
          id: randomUUID(),
          userId: booking.userId,
          refId: booking.id,
          type: paid
            ? TransactionType.BOOKING_BALANCE
            : TransactionType.BOOKING_FULL,
          amount: remaining.toFixed(2),
          status: TransactionStatus.SUCCESS,
          gateway: PaymentMethod.CASH,
        }),
      );
      booking.paidAmount = booking.totalPrice;
      booking.paymentStatus = 'paid';
      booking.paymentMethod ??= PaymentMethod.CASH;
      if (note) booking.ownerNote = note;
      await manager.save(BookingEntity, booking);
      return PaymentTransactionResponseDto.fromEntity(tx);
    });
  }
}
