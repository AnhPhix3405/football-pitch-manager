import { Injectable } from '@nestjs/common';
import { BookingRepository } from '~/repositories/booking.repository';
import { TransactionRepository } from '~/repositories/transaction.repository';
import {
  PaymentMethod,
  TransactionStatus,
  VnpayResponseCode,
} from '../constants/payment.constant';
import { VnpayIpnResponse } from '../interfaces/payment.interface';
import { VnpayService } from './vnpay.service';

@Injectable()
export class VnpayIpnService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly transactionRepository: TransactionRepository,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async processIpn(
    query: Record<string, string | number | undefined | null>,
  ): Promise<VnpayIpnResponse> {
    // 1. Verify Checksum
    const isSignatureValid = this.vnpayService.verifySecureHash(query);
    if (!isSignatureValid) {
      return {
        RspCode: VnpayResponseCode.INVALID_CHECKSUM,
        Message: 'Invalid Checksum',
      };
    }

    const txnRef = typeof query.vnp_TxnRef === 'string' ? query.vnp_TxnRef : '';
    if (!txnRef) {
      return {
        RspCode: VnpayResponseCode.ORDER_NOT_FOUND,
        Message: 'Order not found',
      };
    }

    // 2. Find Transaction
    const transaction =
      (await this.transactionRepository.findById(txnRef)) ||
      (await this.transactionRepository.findByGatewayRef(txnRef));

    if (!transaction) {
      return {
        RspCode: VnpayResponseCode.ORDER_NOT_FOUND,
        Message: 'Order not found',
      };
    }

    // 3. Verify Amount (VNPay amount is multiplied by 100)
    const vnpAmount = Number(query.vnp_Amount || 0) / 100;
    const txAmount = Number(transaction.amount);
    if (Math.abs(vnpAmount - txAmount) > 0.01) {
      return {
        RspCode: VnpayResponseCode.INVALID_AMOUNT,
        Message: 'Invalid Amount',
      };
    }

    // 4. Idempotency Check: if order is already confirmed
    if (transaction.status !== (TransactionStatus.PENDING as string)) {
      return {
        RspCode: VnpayResponseCode.ORDER_ALREADY_CONFIRMED,
        Message: 'Order already confirmed',
      };
    }

    // 5. Update Status
    const responseCode =
      typeof query.vnp_ResponseCode === 'string' ? query.vnp_ResponseCode : '';
    const transactionNo =
      typeof query.vnp_TransactionNo === 'string'
        ? query.vnp_TransactionNo
        : null;

    if (responseCode === '00') {
      transaction.status = TransactionStatus.SUCCESS;
      transaction.gateway = PaymentMethod.VNPAY;
      transaction.gatewayRef = transactionNo;
      await this.transactionRepository.save(transaction);

      // Synchronize Booking
      const booking = await this.bookingRepository.findById(transaction.refId);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.paymentMethod = PaymentMethod.VNPAY;
        await this.bookingRepository.save(booking);
      }
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.gateway = PaymentMethod.VNPAY;
      transaction.gatewayRef = transactionNo;
      await this.transactionRepository.save(transaction);
    }

    return {
      RspCode: VnpayResponseCode.SUCCESS,
      Message: 'Confirm Success',
    };
  }
}
