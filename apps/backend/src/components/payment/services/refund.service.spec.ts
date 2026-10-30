/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { ApplicationException } from '~/common/exceptions/application.exception';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldEntity } from '~/entities/field.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { TransactionEntity } from '~/entities/transaction.entity';
import { BookingRepository } from '~/repositories/booking.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { TransactionRepository } from '~/repositories/transaction.repository';
import {
  TransactionStatus,
  TransactionType,
} from '../constants/payment.constant';
import { RefundService } from './refund.service';

describe('RefundService', () => {
  let refundService: RefundService;
  let bookingRepo: jest.Mocked<BookingRepository>;
  let transactionRepo: jest.Mocked<TransactionRepository>;
  let ownerProfileRepo: jest.Mocked<OwnerProfileRepository>;

  beforeEach(() => {
    bookingRepo = {
      findDetailById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    transactionRepo = {
      findByRefIdAndType: jest.fn(),
      createTransaction: jest.fn(),
    } as unknown as jest.Mocked<TransactionRepository>;

    ownerProfileRepo = {
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<OwnerProfileRepository>;

    refundService = new RefundService(
      bookingRepo,
      transactionRepo,
      ownerProfileRepo,
    );
  });

  it('successfully refunds paid cancelled booking and records refund transaction', async () => {
    const mockOwner = {
      id: 'owner-profile-1',
      userId: 'owner-user',
    } as OwnerProfileEntity;
    const mockField = {
      id: 'field-1',
      ownerId: 'owner-profile-1',
    } as FieldEntity;
    const mockBooking = {
      id: 'booking-1',
      userId: 'user-1',
      field: mockField,
      status: 'cancelled',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      totalPrice: '150000.00',
    } as BookingEntity;

    const mockOriginalTx = {
      id: 'tx-1',
      amount: '150000.00',
      gateway: 'cash',
      gatewayRef: null,
    } as TransactionEntity;

    const mockRefundTx = {
      id: 'refund-tx-1',
      amount: '150000.00',
      status: TransactionStatus.SUCCESS,
      createdAt: new Date(),
    } as TransactionEntity;

    ownerProfileRepo.findByUserId.mockResolvedValue(mockOwner);
    bookingRepo.findDetailById.mockResolvedValue(mockBooking);
    transactionRepo.findByRefIdAndType.mockResolvedValue(mockOriginalTx);
    transactionRepo.createTransaction.mockResolvedValue(mockRefundTx);
    bookingRepo.save.mockImplementation((item) => Promise.resolve(item));

    const result = await refundService.processRefund(
      'booking-1',
      'owner-user',
      'owner',
      { reason: 'Customer requested cancellation' },
    );

    expect(result.refundTransactionId).toBe('refund-tx-1');
    expect(result.paymentStatus).toBe('refunded');
    expect(mockBooking.paymentStatus).toBe('refunded');
    expect(transactionRepo.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TransactionType.REFUND,
        amount: '150000.00',
        status: TransactionStatus.SUCCESS,
      }),
    );
  });

  it('rejects refund if booking is not paid', async () => {
    const mockOwner = {
      id: 'owner-profile-1',
      userId: 'owner-user',
    } as OwnerProfileEntity;
    const mockField = {
      id: 'field-1',
      ownerId: 'owner-profile-1',
    } as FieldEntity;
    const mockBooking = {
      id: 'booking-1',
      field: mockField,
      status: 'cancelled',
      paymentStatus: 'unpaid',
    } as BookingEntity;

    ownerProfileRepo.findByUserId.mockResolvedValue(mockOwner);
    bookingRepo.findDetailById.mockResolvedValue(mockBooking);

    await expect(
      refundService.processRefund('booking-1', 'owner-user', 'owner', {}),
    ).rejects.toThrow(ApplicationException);
  });

  it('rejects duplicate refund if already refunded', async () => {
    const mockOwner = {
      id: 'owner-profile-1',
      userId: 'owner-user',
    } as OwnerProfileEntity;
    const mockField = {
      id: 'field-1',
      ownerId: 'owner-profile-1',
    } as FieldEntity;
    const mockBooking = {
      id: 'booking-1',
      field: mockField,
      status: 'cancelled',
      paymentStatus: 'refunded',
    } as BookingEntity;

    ownerProfileRepo.findByUserId.mockResolvedValue(mockOwner);
    bookingRepo.findDetailById.mockResolvedValue(mockBooking);

    await expect(
      refundService.processRefund('booking-1', 'owner-user', 'owner', {}),
    ).rejects.toThrow(ApplicationException);
  });
});
