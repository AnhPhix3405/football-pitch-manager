import { registerAs } from '@nestjs/config';

export const paymentConfig = registerAs('payment', () => ({
  vnpay: {
    url:
      process.env.VNPAY_URL ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    tmnCode: process.env.VNPAY_TMN_CODE || 'CGXZLS0Z',
    hashSecret:
      process.env.VNPAY_HASH_SECRET || 'XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN',
    returnUrl:
      process.env.VNPAY_RETURN_URL ||
      'http://localhost:3000/api/v1/payments/vnpay/return',
  },
}));
