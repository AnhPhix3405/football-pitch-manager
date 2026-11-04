import { useCallback, useEffect, useState } from 'react'
import type { BackendFieldItem } from '../../fields/service/field.service'
import type { OwnerBooking, OwnerBookingQuery } from '../interface/owner-booking.types'
import { getOwnerBookings, getOwnerFields } from '../service/owner.service'

export function useOwnerBookings(status: string, bookingDate?: string) {
  const [fields, setFields] = useState<BackendFieldItem[]>([])
  const [fieldId, setFieldId] = useState('')
  const [bookings, setBookings] = useState<OwnerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getOwnerFields({ page: 1, limit: 100 })
      .then((result) => {
        if (!active) return
        setFields(result.items)
        setFieldId((current) => current || result.items[0]?.id || '')
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load fields')
      })
    return () => { active = false }
  }, [])

  const reload = useCallback(async () => {
    if (!fieldId) {
      setBookings([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const query: OwnerBookingQuery = { page: 1, limit: 100 }
      if (status !== 'all') query.status = status as OwnerBookingQuery['status']
      if (bookingDate) query.bookingDate = bookingDate
      const result = await getOwnerBookings(fieldId, query)
      setBookings(result.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [bookingDate, fieldId, status])

  useEffect(() => { void reload() }, [reload])

  return { fields, fieldId, setFieldId, bookings, loading, error, reload }
}
