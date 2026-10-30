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
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../constants/payment.constant';
import { PaymentService } from './payment.service';
import { VnpayService } from './vnpay.service';

describe('PaymentService - Cash & Method Selection', () => {
  let paymentService: PaymentService;
  let bookingRepo: jest.Mocked<BookingRepository>;
  let transactionRepo: jest.Mocked<TransactionRepository>;
  let ownerProfileRepo: jest.Mocked<OwnerProfileRepository>;
  let vnpayService: jest.Mocked<VnpayService>;

  beforeEach(() => {
    bookingRepo = {
      findById: jest.fn(),
      findDetailById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<BookingRepository>;

    transactionRepo = {
      findByRefIdAndType: jest.fn(),
      createTransaction: jest.fn(),
      save: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<TransactionRepository>;

    ownerProfileRepo = {
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<OwnerProfileRepository>;

    vnpayService = {
      createPaymentUrl: jest.fn(),
    } as unknown as jest.Mocked<VnpayService>;

    paymentService = new PaymentService(
      bookingRepo,
      transactionRepo,
      ownerProfileRepo,
      vnpayService,
    );
  });

  describe('selectPaymentMethod', () => {
    it('allows user to select cash and creates pending transaction', async () => {
      const mockBooking = {
        id: 'booking-1',
        userId: 'user-1',
        status: 'pending',
        paymentStatus: 'unpaid',
        totalPrice: '200000.00',
        depositAmount: '50000.00',
      } as BookingEntity;

      const mockTx = {
        id: 'tx-1',
        userId: 'user-1',
        refId: 'booking-1',
        type: TransactionType.BOOKING_DEPOSIT,
        amount: '50000.00',
        status: TransactionStatus.PENDING,
        gateway: PaymentMethod.CASH,
      } as TransactionEntity;

      bookingRepo.findById.mockResolvedValue(mockBooking);
      transactionRepo.findByRefIdAndType.mockResolvedValue(null);
      transactionRepo.createTransaction.mockResolvedValue(mockTx);
      bookingRepo.save.mockResolvedValue(mockBooking);

      const result = await paymentService.selectPaymentMethod(
        'booking-1',
        'user-1',
        { method: PaymentMethod.CASH },
      );

      expect(result.id).toBe('tx-1');
      expect(result.gateway).toBe(PaymentMethod.CASH);
      expect(bookingRepo.save).toHaveBeenCalled();
    });

    it('rejects if booking does not belong to user', async () => {
      const mockBooking = {
        id: 'booking-1',
        userId: 'other-user',
      } as BookingEntity;

      bookingRepo.findById.mockResolvedValue(mockBooking);

      await expect(
        paymentService.selectPaymentMethod('booking-1', 'user-1', {
          method: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(ApplicationException);
    });

    it('rejects if booking is already paid', async () => {
      const mockBooking = {
        id: 'booking-1',
        userId: 'user-1',
        paymentStatus: 'paid',
      } as BookingEntity;

      bookingRepo.findById.mockResolvedValue(mockBooking);

      await expect(
        paymentService.selectPaymentMethod('booking-1', 'user-1', {
          method: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(ApplicationException);
    });
  });

  describe('createVnpayUrl', () => {
    it('initializes vnpay payment and generates payment url', async () => {
      const mockBooking = {
        id: 'booking-1',
        userId: 'user-1',
        status: 'pending',
        paymentStatus: 'unpaid',
        totalPrice: '200000.00',
        depositAmount: '50000.00',
      } as BookingEntity;

      const mockTx = {
        id: 'tx-1',
        userId: 'user-1',
        refId: 'booking-1',
        type: TransactionType.BOOKING_DEPOSIT,
        amount: '50000.00',
        status: TransactionStatus.PENDING,
        gateway: PaymentMethod.VNPAY,
      } as TransactionEntity;

      bookingRepo.findById.mockResolvedValue(mockBooking);
      transactionRepo.findByRefIdAndType.mockResolvedValue(null);
      transactionRepo.createTransaction.mockResolvedValue(mockTx);
      bookingRepo.save.mockResolvedValue(mockBooking);
      vnpayService.createPaymentUrl.mockReturnValue(
        'https://sandbox.vnpayment.vn/test',
      );

      const result = await paymentService.createVnpayUrl(
        'user-1',
        { bookingId: 'booking-1' },
        '127.0.0.1',
      );

      expect(result.paymentUrl).toBe('https://sandbox.vnpayment.vn/test');
      expect(result.txnRef).toBe('tx-1');
      expect(vnpayService.createPaymentUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50000,
          txnRef: 'tx-1',
        }),
      );
    });
  });

  describe('confirmCashPayment', () => {
    it('allows owner to confirm cash and sets booking paymentStatus to paid', async () => {
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
        status: 'confirmed',
        paymentStatus: 'unpaid',
        paymentMethod: PaymentMethod.CASH,
        totalPrice: '200000.00',
      } as BookingEntity;

      const mockTx = {
        id: 'tx-1',
        userId: 'user-1',
        refId: 'booking-1',
        type: TransactionType.BOOKING_DEPOSIT,
        amount: '200000.00',
        status: TransactionStatus.PENDING,
        gateway: PaymentMethod.CASH,
      } as TransactionEntity;

      ownerProfileRepo.findByUserId.mockResolvedValue(mockOwner);
      bookingRepo.findDetailById.mockResolvedValue(mockBooking);
      transactionRepo.findByRefIdAndType.mockResolvedValue(mockTx);
      transactionRepo.save.mockImplementation((item) => Promise.resolve(item));
      bookingRepo.save.mockImplementation((item) => Promise.resolve(item));

      const result = await paymentService.confirmCashPayment(
        'booking-1',
        'owner-user',
        { note: 'Received cash' },
      );

      expect(mockBooking.paymentStatus).toBe('paid');
      expect(mockTx.status).toBe(TransactionStatus.SUCCESS);
      expect(result.status).toBe(TransactionStatus.SUCCESS);
    });

    it('rejects if owner is not authorized for the field', async () => {
      const mockOwner = {
        id: 'owner-profile-2',
        userId: 'owner-user',
      } as OwnerProfileEntity;
      const mockField = {
        id: 'field-1',
        ownerId: 'owner-profile-1',
      } as FieldEntity;
      const mockBooking = {
        id: 'booking-1',
        field: mockField,
      } as BookingEntity;

      ownerProfileRepo.findByUserId.mockResolvedValue(mockOwner);
      bookingRepo.findDetailById.mockResolvedValue(mockBooking);

      await expect(
        paymentService.confirmCashPayment('booking-1', 'owner-user'),
      ).rejects.toThrow(ApplicationException);
    });
  });
});
