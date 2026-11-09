import type { PaymentMethod, TransactionStatus, TransactionType } from '../constants/payment.constant'

export interface SelectPaymentMethodPayload {
  method: PaymentMethod
}

export interface CreateVnpayUrlPayload {
  bookingId: string
  option?: Exclude<BookingPaymentOption, 'cash'>
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
  status?: string
  isValid: boolean
  isSuccess: boolean
  txnRef?: string
  transactionNo?: string
  amount: number
  bankCode?: string
  message: string
}

export type BookingPaymentOption = 'cash' | 'deposit' | 'full'
export type CashPaymentSelection = { method: 'cash' }

export interface FieldPaymentOptions {
  options: BookingPaymentOption[]
  depositType: 'fixed' | 'percentage' | null
  depositValue: number | null
}

export interface OwnerPaymentSettings extends FieldPaymentOptions {
  terminalCode: string | null
}

export interface SaveOwnerPaymentSettings extends FieldPaymentOptions {
  terminalCode?: string
  hashSecret?: string
}

export interface ConfirmCashPaymentPayload {
  note?: string
}

export interface RefundPaymentPayload {
  amount?: number
  reason: string
}

