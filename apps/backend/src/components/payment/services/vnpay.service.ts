import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateVnpayUrlParams } from '../interfaces/payment.interface';

@Injectable()
export class VnpayService {
  private readonly vnpUrl: string;
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly returnUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.vnpUrl =
      this.configService.get<string>('payment.vnpay.url') ||
      process.env.VNPAY_URL ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.tmnCode =
      this.configService.get<string>('payment.vnpay.tmnCode') ||
      process.env.VNPAY_TMN_CODE ||
      'CGXZLS0Z';
    this.hashSecret =
      this.configService.get<string>('payment.vnpay.hashSecret') ||
      process.env.VNPAY_HASH_SECRET ||
      'XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN';
    this.returnUrl =
      this.configService.get<string>('payment.vnpay.returnUrl') ||
      process.env.VNPAY_RETURN_URL ||
      'http://localhost:3000/api/v1/payments/vnpay/return';
  }

  createPaymentUrl(params: CreateVnpayUrlParams): string {
    const createDate = this.formatDate(new Date());

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: (Math.round(params.amount) * 100).toString(),
      vnp_ReturnUrl: params.returnUrl || this.returnUrl,
      vnp_IpAddr: params.ipAddr || '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedParams = this.sortObject(vnpParams);
    const signData = this.buildQueryString(sortedParams);
    const signed = this.signHmacSha512(this.hashSecret, signData);

    return `${this.vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
  }

  verifySecureHash(
    params: Record<string, string | number | undefined | null>,
  ): boolean {
    const inputHash =
      typeof params.vnp_SecureHash === 'string' ? params.vnp_SecureHash : '';
    if (!inputHash) {
      return false;
    }

    const cleanParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (
        key !== 'vnp_SecureHash' &&
        key !== 'vnp_SecureHashType' &&
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        cleanParams[key] = String(value);
      }
    }

    const sortedParams = this.sortObject(cleanParams);
    const signData = this.buildQueryString(sortedParams);
    const calculatedHash = this.signHmacSha512(this.hashSecret, signData);

    return inputHash.toLowerCase() === calculatedHash.toLowerCase();
  }

  signHmacSha512(secret: string, data: string): string {
    return crypto
      .createHmac('sha512', Buffer.from(secret, 'utf-8'))
      .update(Buffer.from(data, 'utf-8'))
      .digest('hex');
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  private buildQueryString(obj: Record<string, string>): string {
    return Object.keys(obj)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`,
      )
      .join('&');
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }
}
