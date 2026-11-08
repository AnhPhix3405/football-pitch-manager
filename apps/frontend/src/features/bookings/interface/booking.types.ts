import type { BOOKING_STATUS, BookingStatus } from '~/constants/booking.constant'
import type { FootballField } from '../../fields/interface/field.types'

export type BookingFilterType = 'upcoming' | 'pending' | 'history'

export interface BookingServiceItemDto {
  serviceId: string
  serviceName?: string
  quantity: number
  priceSnapshot: number
  subtotal: number
}

export interface BookingStatusHistoryDto {
  id: string
  fromStatus: string | null
  toStatus: string
  changedByUserId: string
  changedByRole: string
  reason: string | null
  createdAt: string
}

export interface BackendBooking {
  id: string
  fieldId: string
  fieldName?: string
  requestedCourtType: string
  fieldCourtId?: string | null
  courtName?: string | null
  bookingDate: string
  startTime: string
  endTime: string
  status: BookingStatus
  totalPrice: number
  depositAmount: number
  paymentStatus: string
  paymentMethod?: string | null
  ownerNote?: string | null
  cancelledBy?: string | null
  cancelReason?: string | null
  version?: number
  services?: BookingServiceItemDto[]
  statusHistories?: BookingStatusHistoryDto[]
  createdAt: string
  updatedAt: string
}

export interface BackendBookingListResponse {
  data: BackendBooking[]
  total: number
  page: number
  limit: number
}

export interface UserBookingQueryParams {
  status?: (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS]
  bookingDate?: string
  page?: number
  limit?: number
}

export interface CancelBookingPayload {
  reason: string
}

export interface CreateBookingServiceItemInput {
  serviceId: string
  quantity: number
}

export interface CreateBookingPayload {
  fieldId: string
  courtType: '5' | '7' | '11' | string
  bookingDate: string
  startTime: string
  endTime: string
  services?: CreateBookingServiceItemInput[]
}

export interface AvailabilityQueryParams {
  date: string
  courtType?: string
  startTime?: string
  endTime?: string
}

export interface CourtTypeAvailability {
  courtType: string
  isAvailable: boolean
  totalCourts: number
  availableCourts: number
  assignedCourts?: string[]
}

export interface FieldAvailabilityResponse {
  date: string
  isFieldOpen: boolean
  courtTypes: CourtTypeAvailability[]
}

export interface PriceQuoteQueryParams {
  courtType: string
  date: string
  startTime: string
  endTime: string
}

export interface PriceQuoteResponse {
  courtType: string
  durationHours: number
  pitchPrice: number
  depositAmount: number
  ratePerHour: number
}

/**
 * Standardized UI Booking representation for components
 */
export interface UiBooking {
  id: string
  fieldId: string
  field: string
  location: string
  date: string
  time: string
  price: number
  depositAmount: number
  remainingAmount: number
  status: BookingStatus
  courtName?: string | null
  courtType: string
  paymentStatus: string
  image: string
  services?: BookingServiceItemDto[]
  cancelReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CancellationPreviewData {
  bookingId: string
  hoursUntilMatch: number
  canCancel: boolean
  penaltyPercentage: number
  depositAmount: number
  penaltyAmount: number
  refundAmount: number
  policyDescription: string
  blockReason?: string
}

export interface BookingCardProps {
  booking: UiBooking
  onCancel?: (id: string) => void
  onViewDetails?: (booking: UiBooking) => void
  onReview?: (booking: UiBooking) => void
  onPay?: (booking: UiBooking) => void
}

export interface BookingFlowProps {
  field: FootballField
  open: boolean
  onClose: () => void
  onSuccess?: (bookingId: string) => void
}
