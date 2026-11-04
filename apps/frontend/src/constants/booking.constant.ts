export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]

export const BOOKING_TIME_SLOTS = [
  { label: '17:00 – 18:00', startTime: '17:00', endTime: '18:00' },
  { label: '18:00 – 19:00', startTime: '18:00', endTime: '19:00' },
  { label: '19:00 – 20:00', startTime: '19:00', endTime: '20:00' },
  { label: '20:00 – 21:00', startTime: '20:00', endTime: '21:00' },
  { label: '21:00 – 22:00', startTime: '21:00', endTime: '22:00' },
] as const

export const COURT_TYPE_OPTIONS = [
  { value: '5', label: 'Sân 5 người (5v5)' },
  { value: '7', label: 'Sân 7 người (7v7)' },
  { value: '11', label: 'Sân 11 người (11v11)' },
] as const
