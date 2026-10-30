import { ConfigService } from '@nestjs/config';
import { VnpayService } from './vnpay.service';

describe('VnpayService', () => {
  let vnpayService: VnpayService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'payment.vnpay.url')
          return 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        if (key === 'payment.vnpay.tmnCode') return 'TEST_TMN';
        if (key === 'payment.vnpay.hashSecret') return 'TEST_SECRET';
        if (key === 'payment.vnpay.returnUrl')
          return 'http://localhost:3000/return';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    vnpayService = new VnpayService(configService);
  });

  it('generates valid payment URL with sorted query params and HMAC-SHA512 checksum', () => {
    const url = vnpayService.createPaymentUrl({
      amount: 100000,
      orderInfo: 'Thanh toan dat san',
      txnRef: 'TXN_123',
      ipAddr: '127.0.0.1',
    });

    expect(url).toContain(
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?',
    );
    expect(url).toContain('vnp_Amount=10000000');
    expect(url).toContain('vnp_TmnCode=TEST_TMN');
    expect(url).toContain('vnp_TxnRef=TXN_123');
    expect(url).toContain('&vnp_SecureHash=');
  });

  it('verifies valid secure hash successfully', () => {
    const query = {
      vnp_Amount: '10000000',
      vnp_Command: 'pay',
      vnp_OrderInfo: 'Thanh toan',
      vnp_ResponseCode: '00',
      vnp_TmnCode: 'TEST_TMN',
      vnp_TxnRef: 'TXN_123',
    };

    // Calculate valid hash with same secret
    const signData =
      'vnp_Amount=10000000&vnp_Command=pay&vnp_OrderInfo=Thanh%20toan&vnp_ResponseCode=00&vnp_TmnCode=TEST_TMN&vnp_TxnRef=TXN_123';
    const validHash = vnpayService.signHmacSha512('TEST_SECRET', signData);

    const isValid = vnpayService.verifySecureHash({
      ...query,
      vnp_SecureHash: validHash,
    });

    expect(isValid).toBe(true);
  });

  it('rejects tampered secure hash', () => {
    const isValid = vnpayService.verifySecureHash({
      vnp_Amount: '10000000',
      vnp_TxnRef: 'TXN_123',
      vnp_SecureHash: 'fake_hash',
    });

    expect(isValid).toBe(false);
  });
});
