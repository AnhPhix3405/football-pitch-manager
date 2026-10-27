import { useState, useTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  AppNotification,
  NotificationFilter,
} from '../interfaces/notification.interface'
import {
  filterNotifications,
  getInitialNotifications,
  markAllAsReadInList,
  markAsReadInList,
} from '../service/notification.service'

export function useNotifications() {
  const navigate = useNavigate()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>(getInitialNotifications)
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const unreadCount = items.filter((n) => !n.isRead).length
  const displayedItems = filterNotifications(items, filter)

  const markAllRead = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setItems((prev) => markAllAsReadInList(prev))
  }

  const markItemAsRead = (id: string) => {
    setItems((prev) => markAsReadInList(prev, id))
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
    filter,
    setFilter,
    unreadCount,
    displayedItems,
    markAllRead,
    markItemAsRead,
    handleItemClick,
  }
}
