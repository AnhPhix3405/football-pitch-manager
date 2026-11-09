import { useEffect, useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { notification as antNotification } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '~/app/hooks'
import { connectChatSocket } from '~/features/chat/service/chat-socket.service'
import type {
  AppNotification,
  NotificationFilter,
} from '../interfaces/notification.interface'
import {
  filterNotifications,
  getNotificationsApi,
  getUnreadCountApi,
  mapBackendNotification,
  markAllAsReadInList,
  markAllNotificationsAsReadApi,
  markAsReadInList,
  markNotificationAsReadApi,
} from '../service/notification.service'

export function useNotifications() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [revision, setRevision] = useState(0)

  const currentUser = useAppSelector((state) => state.auth.user)
  const isLoggedIn = Boolean(currentUser)

  // 1. Fetch notifications from backend
  useEffect(() => {
    if (!isLoggedIn) {
      setItems([])
      setUnreadCount(0)
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

    getUnreadCountApi()
      .then((count) => {
        if (isSubscribed) setUnreadCount(count)
      })
      .catch(() => undefined)

    return () => {
      isSubscribed = false
    }
  }, [isLoggedIn, currentUser?.id, filter, revision])

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
        setRevision((value) => value + 1)

        setItems((prev) => {
          if (prev.some((n) => n.id === formatted.id)) {
            return prev
          }
          return [formatted, ...prev]
        })

        // Hiển thị toast popup thông báo nhanh
        antNotification.info({
          message: t(`notifications.eventTitles.${formatted.type}`, { defaultValue: formatted.title }),
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
      const onConnect = () => setRevision((value) => value + 1)
      socket.on('connect', onConnect)

      return () => {
        socket?.off('notification:new', onNewNotification)
        socket?.off('connect', onConnect)
      }
    } catch {
      // Socket connection error handling
    }
  }, [isLoggedIn, currentUser?.id, navigate, t])

  const displayedItems = filterNotifications(items, filter)

  const markAllRead = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setItems((prev) => markAllAsReadInList(prev))
    try {
      await markAllNotificationsAsReadApi()
    } catch {
      // The refresh restores the persisted read state if the request failed.
    } finally {
      setRevision((value) => value + 1)
    }
  }

  const markItemAsRead = async (id: string) => {
    setItems((prev) => markAsReadInList(prev, id))
    try {
      await markNotificationAsReadApi(id)
    } catch {
      // The refresh restores the persisted read state if the request failed.
    } finally {
      setRevision((value) => value + 1)
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
