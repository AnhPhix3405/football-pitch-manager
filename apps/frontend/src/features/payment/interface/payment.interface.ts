import type { PaymentMethod, TransactionStatus, TransactionType } from '../constants/payment.constant'

export interface SelectPaymentMethodPayload {
  method: PaymentMethod
}

export interface CreateVnpayUrlPayload {
  bookingId: string
  orderInfo?: string
}

export interface VnpayUrlResponse {
  paymentUrl: string
  txnRef: string
}

export interface PaymentTransaction {
  id: string
  userId: string
  type: TransactionType | string
  refId: string
  amount: string
  status: TransactionStatus | string
  gateway: string | null
  gatewayRef: string | null
  createdAt: string
  updatedAt: string
}

export interface VnpayReturnVerification {
  isValid: boolean
  isSuccess: boolean
  txnRef?: string
  transactionNo?: string
  amount: number
  bankCode?: string
  message: string
}

export interface ConfirmCashPaymentPayload {
  note?: string
}

export interface RefundPaymentPayload {
  amount?: number
  reason: string
}

