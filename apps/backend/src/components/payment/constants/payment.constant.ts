export enum PaymentMethod {
  CASH = 'cash',
  VNPAY = 'vnpay',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  BOOKING_DEPOSIT = 'booking_deposit',
  SUBSCRIPTION = 'subscription',
  REFUND = 'refund',
}

export enum VnpayResponseCode {
  SUCCESS = '00',
  ORDER_NOT_FOUND = '01',
  ORDER_ALREADY_CONFIRMED = '02',
  INVALID_AMOUNT = '04',
  INVALID_CHECKSUM = '97',
  OTHER_ERROR = '99',
}
