export const PAYMENT_METHOD = {
  CASH: 'cash',
  VNPAY: 'vnpay',
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const

export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]

export const TRANSACTION_TYPE = {
  BOOKING_DEPOSIT: 'booking_deposit',
  SUBSCRIPTION: 'subscription',
  REFUND: 'refund',
} as const

export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]

export const VNPAY_RESPONSE_CODE = {
  SUCCESS: '00',
  SUSPECTED_FRAUD: '07',
  NOT_REGISTERED_INTERNET_BANKING: '09',
  AUTHENTICATION_FAILED_3_TIMES: '10',
  PAYMENT_TIMEOUT: '11',
  ACCOUNT_LOCKED: '12',
  INVALID_OTP: '13',
  TRANSACTION_CANCELLED_BY_USER: '24',
  INSUFFICIENT_FUNDS: '51',
  EXCEEDED_DAILY_LIMIT: '65',
  BANK_UNDER_MAINTENANCE: '75',
  EXCEEDED_PIN_ATTEMPTS: '79',
  OTHER_ERROR: '99',
} as const

export type VnpayResponseCode = (typeof VNPAY_RESPONSE_CODE)[keyof typeof VNPAY_RESPONSE_CODE]
