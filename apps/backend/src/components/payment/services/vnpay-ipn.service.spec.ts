/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { BookingEntity } from '~/entities/booking.entity';
import { TransactionEntity } from '~/entities/transaction.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { TransactionRepository } from '~/repositories/transaction.repository';
import {
  PaymentMethod,
  TransactionStatus,
  VnpayResponseCode,
} from '../constants/payment.constant';
import { VnpayIpnService } from './vnpay-ipn.service';
import { VnpayService } from './vnpay.service';

describe('VnpayIpnService - Idempotency & Webhook handling', () => {
  let ipnService: VnpayIpnService;
  let vnpayService: jest.Mocked<VnpayService>;
  let transactionRepo: jest.Mocked<TransactionRepository>;
  let bookingRepo: jest.Mocked<BookingRepository>;

  beforeEach(() => {
    vnpayService = {
      verifySecureHash: jest.fn(),
    } as unknown as jest.Mocked<VnpayService>;

    transactionRepo = {
      findById: jest.fn(),
      findByGatewayRef: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<TransactionRepository>;

    bookingRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    ipnService = new VnpayIpnService(
      vnpayService,
      transactionRepo,
      bookingRepo,
    );
  });

  it('rejects IPN when checksum signature is invalid', async () => {
    vnpayService.verifySecureHash.mockReturnValue(false);

    const result = await ipnService.processIpn({
      vnp_TxnRef: 'tx-1',
      vnp_SecureHash: 'invalid',
    });

    expect(result.RspCode).toBe(VnpayResponseCode.INVALID_CHECKSUM);
    expect(result.Message).toBe('Invalid Checksum');
  });

  it('returns Order not found if transaction does not exist', async () => {
    vnpayService.verifySecureHash.mockReturnValue(true);
    transactionRepo.findById.mockResolvedValue(null);
    transactionRepo.findByGatewayRef.mockResolvedValue(null);

    const result = await ipnService.processIpn({
      vnp_TxnRef: 'non-existing-tx',
      vnp_Amount: '10000000',
    });

    expect(result.RspCode).toBe(VnpayResponseCode.ORDER_NOT_FOUND);
  });

  it('rejects IPN when amount does not match', async () => {
    vnpayService.verifySecureHash.mockReturnValue(true);
    const mockTx = {
      id: 'tx-1',
      amount: '200000.00',
      status: TransactionStatus.PENDING,
    } as TransactionEntity;
    transactionRepo.findById.mockResolvedValue(mockTx);

    const result = await ipnService.processIpn({
      vnp_TxnRef: 'tx-1',
      vnp_Amount: '10000000', // 100,000 VND != 200,000 VND
    });

    expect(result.RspCode).toBe(VnpayResponseCode.INVALID_AMOUNT);
  });

  it('returns Order already confirmed on duplicate IPN without reprocessing', async () => {
    vnpayService.verifySecureHash.mockReturnValue(true);
    const mockTx = {
      id: 'tx-1',
      amount: '100000.00',
      status: TransactionStatus.SUCCESS, // already processed!
    } as TransactionEntity;
    transactionRepo.findById.mockResolvedValue(mockTx);

    const result = await ipnService.processIpn({
      vnp_TxnRef: 'tx-1',
      vnp_Amount: '10000000',
      vnp_ResponseCode: '00',
    });

    expect(result.RspCode).toBe(VnpayResponseCode.ORDER_ALREADY_CONFIRMED);
    expect(transactionRepo.save).not.toHaveBeenCalled();
    expect(bookingRepo.save).not.toHaveBeenCalled();
  });

  it('processes IPN successfully and marks transaction and booking as paid', async () => {
    vnpayService.verifySecureHash.mockReturnValue(true);
    const mockTx = {
      id: 'tx-1',
      refId: 'booking-1',
      amount: '100000.00',
      status: TransactionStatus.PENDING,
    } as TransactionEntity;
    const mockBooking = {
      id: 'booking-1',
      paymentStatus: 'unpaid',
    } as BookingEntity;

    transactionRepo.findById.mockResolvedValue(mockTx);
    bookingRepo.findById.mockResolvedValue(mockBooking);
    transactionRepo.save.mockImplementation((item) => Promise.resolve(item));
    bookingRepo.save.mockImplementation((item) => Promise.resolve(item));

    const result = await ipnService.processIpn({
      vnp_TxnRef: 'tx-1',
      vnp_Amount: '10000000',
      vnp_ResponseCode: '00',
      vnp_TransactionNo: 'VNP999888',
    });

    expect(result.RspCode).toBe(VnpayResponseCode.SUCCESS);
    expect(mockTx.status).toBe(TransactionStatus.SUCCESS);
    expect(mockTx.gatewayRef).toBe('VNP999888');
    expect(mockBooking.paymentStatus).toBe('paid');
    expect(mockBooking.paymentMethod).toBe(PaymentMethod.VNPAY);
  });
});
