export const SUBSCRIPTION_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const DEFAULT_AI_QUOTAS = {
  FREE_DAILY_REQUESTS: 3,
  PRO_DAILY_REQUESTS: 50,
  VIP_DAILY_REQUESTS: 200,
} as const;
