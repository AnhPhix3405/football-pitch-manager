import { useCallback, useEffect, useState } from 'react'
import { getOwnerFields } from '../service/owner.service'
import {
  checkCourtAssignment,
  completeOwnerBooking,
  confirmOwnerBooking,
  getOwnerBookingDetail,
  getOwnerCourts,
  rejectOwnerBooking,
} from '../service/owner.service'
import type { OwnerBooking, OwnerCourt } from '../interface/owner-booking.types'

export function useOwnerBookingDetail(bookingId: string, preferredFieldId: string) {
  const [fieldId, setFieldId] = useState(preferredFieldId)
  const [booking, setBooking] = useState<OwnerBooking | null>(null)
  const [courts, setCourts] = useState<OwnerCourt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let resolvedFieldId = preferredFieldId
      let detail: OwnerBooking | null = null
      if (resolvedFieldId) {
        detail = await getOwnerBookingDetail(resolvedFieldId, bookingId)
      } else {
        const { items } = await getOwnerFields({ page: 1, limit: 100 })
        for (const field of items) {
          try {
            detail = await getOwnerBookingDetail(field.id, bookingId)
            resolvedFieldId = field.id
            break
          } catch {
            // Booking IDs are scoped to a field; try the next field if this one returns 404.
          }
        }
      }
      if (!detail || !resolvedFieldId) throw new Error('Booking not found')
      setFieldId(resolvedFieldId)
      setBooking(detail)
      const fieldCourts = await getOwnerCourts(resolvedFieldId, detail.requestedCourtType)
      setCourts(fieldCourts)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load booking')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }, [bookingId, preferredFieldId])

  useEffect(() => { void load() }, [load])

  const checkAssignment = async (courtId: string) => {
    if (!booking) return false
    const result = await checkCourtAssignment(fieldId, courtId, {
      courtType: booking.requestedCourtType,
      date: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
    })
    return result.valid
  }

  const confirm = async (courtId: string, note?: string) => {
    const result = await confirmOwnerBooking(fieldId, bookingId, { fieldCourtId: courtId, note })
    setBooking(result)
    return result
  }

  const reject = async (reason: string) => {
    const result = await rejectOwnerBooking(fieldId, bookingId, reason)
    setBooking(result)
    return result
  }

  const complete = async () => {
    const result = await completeOwnerBooking(fieldId, bookingId)
    setBooking(result)
    return result
  }

  return { fieldId, booking, courts, loading, error, reload: load, checkAssignment, confirm, reject, complete }
}
