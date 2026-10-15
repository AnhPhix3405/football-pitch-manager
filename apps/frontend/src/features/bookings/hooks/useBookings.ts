import { useMemo, useState } from 'react'
import { userBookings, type UserBooking } from '../../user/user.data'

export type BookingFilterType = 'upcoming' | 'pending' | 'history'

export function filterBookings(
  bookings: UserBooking[],
  filter: BookingFilterType,
  cancelledIds: string[],
): UserBooking[] {
  return bookings.filter(
    (booking) =>
      !cancelledIds.includes(booking.id) &&
      (filter === 'upcoming'
        ? booking.status === 'confirmed'
        : filter === 'pending'
          ? booking.status === 'pending'
          : ['completed', 'cancelled'].includes(booking.status)),
  )
}

export function useBookings() {
  const [filter, setFilter] = useState<BookingFilterType>('upcoming')
  const [cancelled, setCancelled] = useState<string[]>([])

  const visible = useMemo(
    () => filterBookings(userBookings, filter, cancelled),
    [filter, cancelled],
  )

  const cancel = (id: string) => {
    setCancelled((items) => [...items, id])
  }

  return { filter, setFilter, visible, cancel }
}
