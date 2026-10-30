/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { configureApplication } from '../src/common/configure-application';
import { JwtAuthGuard } from '../src/components/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/components/auth/guards/roles.guard';
import { OwnerPaymentController } from '../src/components/payment/controllers/owner-payment.controller';
import { RefundController } from '../src/components/payment/controllers/refund.controller';
import { UserPaymentController } from '../src/components/payment/controllers/user-payment.controller';
import { VnpayCallbackController } from '../src/components/payment/controllers/vnpay-callback.controller';
import { PaymentService } from '../src/components/payment/services/payment.service';
import { RefundService } from '../src/components/payment/services/refund.service';
import { VnpayIpnService } from '../src/components/payment/services/vnpay-ipn.service';
import { VnpayService } from '../src/components/payment/services/vnpay.service';

describe('Day 7 Payment and Refund API (e2e)', () => {
  let app: NestFastifyApplication;

  const mockPaymentService = {
    selectPaymentMethod: jest.fn(),
    confirmCashPayment: jest.fn(),
    createVnpayUrl: jest.fn(),
  };

  const mockVnpayService = {
    createPaymentUrl: jest.fn(),
    verifySecureHash: jest.fn(),
  };

  const mockVnpayIpnService = {
    processIpn: jest.fn(),
  };

  const mockRefundService = {
    processRefund: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        UserPaymentController,
        OwnerPaymentController,
        VnpayCallbackController,
        RefundController,
      ],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: VnpayService,
          useValue: mockVnpayService,
        },
        {
          provide: VnpayIpnService,
          useValue: mockVnpayIpnService,
        },
        {
          provide: RefundService,
          useValue: mockRefundService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'u-1', email: 'user@test.com', role: 'owner' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApplication(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /bookings/:bookingId/payment-method', () => {
    it('selects payment method successfully', async () => {
      mockPaymentService.selectPaymentMethod.mockResolvedValue({
        id: 'tx-1',
        gateway: 'cash',
        status: 'pending',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/bookings/8f0a0d92-23c2-466d-92a0-4592a407e3d1/payment-method',
        payload: { method: 'cash' },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.gateway).toBe('cash');
    });
  });

  describe('POST /owner/bookings/:bookingId/confirm-cash', () => {
    it('confirms cash payment successfully', async () => {
      mockPaymentService.confirmCashPayment.mockResolvedValue({
        id: 'tx-1',
        gateway: 'cash',
        status: 'success',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/owner/bookings/8f0a0d92-23c2-466d-92a0-4592a407e3d1/confirm-cash',
        payload: { note: 'Paid full cash' },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.status).toBe('success');
    });
  });

  describe('POST /payments/vnpay/create-url', () => {
    it('generates vnpay payment url', async () => {
      mockPaymentService.createVnpayUrl.mockResolvedValue({
        paymentUrl: 'https://sandbox.vnpayment.vn/pay?vnp_TxnRef=tx-1',
        txnRef: 'tx-1',
      });

      const res = await app.inject({
        method: 'POST',
        url: '/payments/vnpay/create-url',
        payload: {
          bookingId: '8f0a0d92-23c2-466d-92a0-4592a407e3d1',
          orderInfo: 'Thanh toan tien coc',
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.paymentUrl).toContain('https://sandbox.vnpayment.vn');
      expect(json.data.txnRef).toBe('tx-1');
    });
  });

  describe('GET /payments/vnpay/ipn', () => {
    it('processes IPN webhook and returns RspCode', async () => {
      mockVnpayIpnService.processIpn.mockResolvedValue({
        RspCode: '00',
        Message: 'Confirm Success',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/payments/vnpay/ipn?vnp_TxnRef=tx-1&vnp_ResponseCode=00&vnp_SecureHash=valid',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.RspCode).toBe('00');
    });
  });

  describe('GET /payments/vnpay/return', () => {
    it('verifies return url and reports transaction status', async () => {
      mockVnpayService.verifySecureHash.mockReturnValue(true);

      const res = await app.inject({
        method: 'GET',
        url: '/payments/vnpay/return?vnp_TxnRef=tx-1&vnp_ResponseCode=00&vnp_Amount=10000000',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.isSuccess).toBe(true);
      expect(json.data.amount).toBe(100000);
    });
  });

  describe('POST /payments/bookings/:bookingId/refund', () => {
    it('processes refund successfully', async () => {
      mockRefundService.processRefund.mockResolvedValue({
        refundTransactionId: 'rf-1',
        bookingId: '8f0a0d92-23c2-466d-92a0-4592a407e3d1',
        refundAmount: '100000.00',
        paymentStatus: 'refunded',
        transactionStatus: 'success',
        reason: 'Customer cancelled',
        createdAt: new Date(),
      });

      const res = await app.inject({
        method: 'POST',
        url: '/payments/bookings/8f0a0d92-23c2-466d-92a0-4592a407e3d1/refund',
        payload: {
          amount: 100000,
          reason: 'Customer cancelled',
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.paymentStatus).toBe('refunded');
      expect(json.data.refundAmount).toBe('100000.00');
    });
  });
});
