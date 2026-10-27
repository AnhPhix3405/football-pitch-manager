export const NOTIFICATION_TYPES = {
  MATCH_REQUEST: 'match_request',
  MATCH_CONFIRMED: 'match_confirmed',
  BOOKING_CONFIRMED: 'booking_confirmed',
  MESSAGE: 'message',
  SYSTEM: 'system',
} as const

export type NotificationType = (
  typeof NOTIFICATION_TYPES
)[keyof typeof NOTIFICATION_TYPES]