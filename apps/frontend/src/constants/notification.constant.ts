export const NOTIFICATION_TYPES = {
  MATCH_REQUEST: 'match_request',
  MATCH_CONFIRMED: 'match_confirmed',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_NEW: 'booking_new',
  BOOKING_DEPOSIT_PAID: 'booking_deposit_paid',
  OWNER_BOOKING_CREATED: 'owner_booking_created',
  OWNER_FIELD_APPROVED: 'owner_field_approved',
  MESSAGE: 'message',
  SYSTEM: 'system',
} as const

export type NotificationType = (
  typeof NOTIFICATION_TYPES
)[keyof typeof NOTIFICATION_TYPES]
