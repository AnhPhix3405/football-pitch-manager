import { useEffect, useState } from 'react'
import { NOTIFICATION_TYPES } from '../constants/notification.constant'
import { connectChatSocket } from '../features/chat/service/chat-socket.service'
import type { OwnerDashboardStats } from '../features/owner/interface/owner-booking.types'
import { getOwnerDashboardStats } from '../features/owner/service/owner.service'

export function useOwnerDashboard() {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null)
  const [error, setError] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getOwnerDashboardStats(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setStats(data)
        setError(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
    return () => controller.abort()
  }, [revision])

  useEffect(() => {
    const socket = connectChatSocket()
    const refresh = (event: { type?: string }) => {
      if (event.type === NOTIFICATION_TYPES.OWNER_BOOKING_CREATED ||
          event.type === NOTIFICATION_TYPES.BOOKING_NEW ||
          event.type === NOTIFICATION_TYPES.BOOKING_DEPOSIT_PAID ||
          event.type === NOTIFICATION_TYPES.OWNER_FIELD_APPROVED) {
        setRevision((value) => value + 1)
      }
    }
    socket.on('notification:new', refresh)
    return () => { socket.off('notification:new', refresh) }
  }, [])

  return {
    stats,
    error,
    retry: () => {
      setError(false)
      setRevision((value) => value + 1)
    },
  }
}
