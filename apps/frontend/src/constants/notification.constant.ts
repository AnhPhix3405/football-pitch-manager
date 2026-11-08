export const NOTIFICATION_TYPES = {
  MATCH_REQUEST: 'match_request',
  MATCH_CONFIRMED: 'match_confirmed',
  BOOKING_CONFIRMED: 'booking_confirmed',
  OWNER_BOOKING_CREATED: 'owner_booking_created',
  OWNER_FIELD_APPROVED: 'owner_field_approved',
  MESSAGE: 'message',
  SYSTEM: 'system',
} as const

export type NotificationType = (
  typeof NOTIFICATION_TYPES
)[keyof typeof NOTIFICATION_TYPES]
