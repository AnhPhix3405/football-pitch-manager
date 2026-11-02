export interface SubscriptionBenefit {
  maxBookingsPerMonth?: number;
  aiQuotaDaily?: number;
  prioritySupport?: boolean;
  featuredField?: boolean;
  [key: string]: unknown;
}
