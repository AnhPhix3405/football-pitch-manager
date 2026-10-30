import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '../constants/payment.constant';

export interface CreatePaymentTransactionParams {
  userId: string;
  type: TransactionType;
  refId: string;
  amount: string;
  gateway: PaymentMethod;
  status?: TransactionStatus;
  gatewayRef?: string | null;
}

export interface VnpayIpnResponse {
  RspCode: string;
  Message: string;
}

export interface CreateVnpayUrlParams {
  ipAddr: string;
  amount: number;
  orderInfo: string;
  txnRef: string;
  returnUrl?: string;
}
