export type OwnerBookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'

export interface OwnerBooking {
  id: string
  fieldId: string
  fieldName?: string
  requestedCourtType: string
  fieldCourtId: string | null
  courtName?: string | null
  bookingDate: string
  startTime: string
  endTime: string
  status: OwnerBookingStatus
  totalPrice: number
  depositAmount: number
  paidAmount?: number | null
  paymentOptions?: string[] | null
  paymentStatus: string
  paymentMethod: string | null
  ownerNote: string | null
  cancelReason: string | null
  services: Array<{ serviceId: string; serviceName?: string; quantity: number; subtotal: number }>
  createdAt: string
}

export interface OwnerBookingQuery {
  status?: OwnerBookingStatus
  bookingDate?: string
  page?: number
  limit?: number
}

export interface OwnerBookingListResponse {
  data: OwnerBooking[]
  total: number
  page: number
  limit: number
}

export interface OwnerDashboardStats {
  monthlyRevenue: number
  todayBookings: number
  activeFields: number
  totalFields: number
  bookedMinutes: number
  availableMinutes: number
  utilizationPercent: number | null
  recentBookings: OwnerBooking[]
}

export interface OwnerCourt {
  id: string
  name: string
  type: string
  status: string
}

export interface OwnerTimelineSlot {
  id: string
  startTime: string
  endTime: string
  status?: string
  reason?: string | null
}

export interface OwnerCourtTimelineItem {
  courtId: string
  courtName: string
  courtType: string
  status: string
  blockedSlots: OwnerTimelineSlot[]
  bookings: OwnerTimelineSlot[]
}

export interface OwnerCourtTimeline {
  fieldId: string
  date: string
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
  courts: OwnerCourtTimelineItem[]
}
