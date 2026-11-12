export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

export const COURT_TYPE_OPTIONS = [
  { value: '5', label: 'Sân 5 người (5v5)' },
  { value: '7', label: 'Sân 7 người (7v7)' },
  { value: '11', label: 'Sân 11 người (11v11)' },
] as const
