import { useCallback, useEffect, useMemo, useState } from 'react'
import { BOOKING_STATUS } from '~/constants/booking.constant'
import type { BookingFilterType, UiBooking } from '../interface/booking.types'
import { cancelBookingApi, getMyBookingsApi } from '../service/booking.service'
import { mapBackendBookingToUi } from '../utils/booking-mapper.util'

export type { BookingFilterType }

export function filterBookings(
  bookings: UiBooking[],
  filter: BookingFilterType,
): UiBooking[] {
  return bookings.filter((b) => {
    if (filter === 'upcoming') {
      return b.status === BOOKING_STATUS.CONFIRMED
    }
    if (filter === 'pending') {
      return b.status === BOOKING_STATUS.PENDING
    }
    // 'history'
    return (
      b.status === BOOKING_STATUS.COMPLETED ||
      b.status === BOOKING_STATUS.CANCELLED ||
      b.status === BOOKING_STATUS.REJECTED
    )
  })
}

export function useBookings() {
  const [filter, setFilter] = useState<BookingFilterType>('upcoming')
  const [bookings, setBookings] = useState<UiBooking[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getMyBookingsApi({ limit: 50 })
      const list = response?.data ?? []
      setBookings(list.map(mapBackendBookingToUi))
      setTotalCount(response?.total ?? list.length)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải danh sách đặt sân'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const visible = useMemo(
    () => filterBookings(bookings, filter),
    [bookings, filter],
  )

  const cancel = useCallback(
    async (id: string, reason = 'Người dùng yêu cầu hủy') => {
      await cancelBookingApi(id, reason)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: BOOKING_STATUS.CANCELLED } : b,
        ),
      )
    },
    [],
  )

  return {
    filter,
    setFilter,
    bookings,
    visible,
    totalCount,
    loading,
    error,
    cancel,
    refetch: fetchBookings,
  }
}
