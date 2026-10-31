import { useEffect, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { notification as antNotification } from 'antd'
import { useAppSelector } from '~/app/hooks'
import { connectChatSocket } from '~/features/chat/service/chat-socket.service'
import type {
  AppNotification,
  NotificationFilter,
} from '../interfaces/notification.interface'
import {
  filterNotifications,
  getNotificationsApi,
  mapBackendNotification,
  markAllAsReadInList,
  markAllNotificationsAsReadApi,
  markAsReadInList,
  markNotificationAsReadApi,
} from '../service/notification.service'

export function useNotifications() {
  const navigate = useNavigate()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [loading, setLoading] = useState(false)

  const currentUser = useAppSelector((state) => state.auth.user)
  const isLoggedIn = Boolean(currentUser)

  // 1. Fetch notifications from backend
  useEffect(() => {
    if (!isLoggedIn) {
      setItems([])
      return
    }

    let isSubscribed = true
    setLoading(true)

    getNotificationsApi(filter)
      .then((data) => {
        if (!isSubscribed) return
        setItems(data)
      })
      .catch(() => {
        if (!isSubscribed) return
        setItems([])
      })
      .finally(() => {
        if (isSubscribed) setLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [isLoggedIn, currentUser?.id, filter])

  // 2. Real-time socket listener for new notifications
  useEffect(() => {
    if (!isLoggedIn) return

    let socket: ReturnType<typeof connectChatSocket> | null = null
    try {
      socket = connectChatSocket()

      const onNewNotification = (raw: {
        id: string
        type: string
        title: string
        content: string | null
        refId: string | null
        isRead: boolean
        createdAt: string
        link?: string
      }) => {
        if (!raw) return
        const formatted = mapBackendNotification(raw)

        setItems((prev) => {
          if (prev.some((n) => n.id === formatted.id)) {
            return prev
          }
          return [formatted, ...prev]
        })

        // Hiển thị toast popup thông báo nhanh
        antNotification.info({
          message: formatted.title,
          description: formatted.content,
          placement: 'topRight',
          onClick: () => {
            if (formatted.link) {
              startTransition(() => {
                navigate(formatted.link!)
              })
            }
          },
        })
      }

      socket.on('notification:new', onNewNotification)

      return () => {
        socket?.off('notification:new', onNewNotification)
      }
    } catch {
      // Socket connection error handling
    }
  }, [isLoggedIn, currentUser?.id, navigate])

  const unreadCount = items.filter((n) => !n.isRead).length
  const displayedItems = filterNotifications(items, filter)

  const markAllRead = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setItems((prev) => markAllAsReadInList(prev))
    try {
      await markAllNotificationsAsReadApi()
    } catch {
      // Rollback or ignore
    }
  }

  const markItemAsRead = async (id: string) => {
    setItems((prev) => markAsReadInList(prev, id))
    try {
      await markNotificationAsReadApi(id)
    } catch {
      // Rollback or ignore
    }
  }

  const handleItemClick = (notification: AppNotification) => {
    markItemAsRead(notification.id)
    setOpen(false)
    if (notification.link) {
      startTransition(() => {
        navigate(notification.link!)
      })
    }
  }

  return {
    open,
    setOpen,
    items,
    loading,
    filter,
    setFilter,
    unreadCount,
    displayedItems,
    markAllRead,
    markItemAsRead,
    handleItemClick,
  }
}
