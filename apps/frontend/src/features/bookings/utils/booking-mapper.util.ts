import type { BackendBooking, UiBooking } from '../interface/booking.types'

export const DEFAULT_BOOKING_IMAGE =
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80'

/**
 * Maps backend booking DTO to UI model
 */
export function mapBackendBookingToUi(b: BackendBooking): UiBooking {
  const deposit = b.depositAmount
  const remaining = Math.max(0, b.totalPrice - (b.paidAmount ?? (b.paymentStatus === 'paid' ? deposit || b.totalPrice : 0)))

  // Format date display (e.g., YYYY-MM-DD -> DD/MM/YYYY)
  let formattedDate = b.bookingDate
  if (b.bookingDate && b.bookingDate.includes('-')) {
    const parts = b.bookingDate.split('-')
    if (parts.length === 3) {
      formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
    }
  }

  const timeSlot =
    b.startTime && b.endTime ? `${b.startTime} – ${b.endTime}` : ''

  return {
    id: b.id,
    fieldId: b.fieldId,
    field: b.fieldName || 'Sân bóng',
    location: 'TP. Hồ Chí Minh',
    date: formattedDate,
    time: timeSlot,
    price: b.totalPrice,
    depositAmount: deposit,
    paidAmount: b.paidAmount,
    paymentOptions: b.paymentOptions,
    remainingAmount: remaining,
    status: b.status,
    courtName: b.courtName,
    courtType: b.requestedCourtType,
    paymentStatus: b.paymentStatus,
    image: DEFAULT_BOOKING_IMAGE,
    services: b.services,
    ownerNote: b.ownerNote,
    phone: b.fieldPhoneNumber || null,
    cancelReason: b.cancelReason,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }
}

