import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  MessageOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Badge, Dropdown, Empty } from 'antd'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { NOTIFICATION_TYPES } from '~/constants/notification.constant'
import { useNotifications } from '../hooks/useNotifications'
import type {
  AppNotification,
  NotificationType,
} from '../interfaces/notification.interface'

function getNotificationIcon(type: NotificationType): React.ReactNode {
  switch (type) {
    case NOTIFICATION_TYPES.MATCH_REQUEST:
    case NOTIFICATION_TYPES.MATCH_CONFIRMED:
      return <TeamOutlined className="notification-item__icon notification-item__icon--team" />
    case NOTIFICATION_TYPES.BOOKING_CONFIRMED:
      return <CalendarOutlined className="notification-item__icon notification-item__icon--booking" />
    case NOTIFICATION_TYPES.MESSAGE:
      return <MessageOutlined className="notification-item__icon notification-item__icon--message" />
    case NOTIFICATION_TYPES.SYSTEM:
    default:
      return <CheckCircleOutlined className="notification-item__icon notification-item__icon--system" />
  }
}

export function NotificationDropdown() {
  const { t } = useTranslation()
  const {
    open,
    setOpen,
    items,
    filter,
    setFilter,
    unreadCount,
    displayedItems,
    markAllRead,
    handleItemClick,
  } = useNotifications()

  const dropdownContent = (
    <div className="notification-dropdown">
      <div className="notification-dropdown__header">
        <div className="notification-dropdown__title-wrap">
          <span className="notification-dropdown__title">
            {t('notifications.title', { defaultValue: 'Thông báo' })}
          </span>
          {unreadCount > 0 && (
            <span className="notification-dropdown__badge">{unreadCount} mới</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notification-dropdown__mark-read-btn"
            onClick={markAllRead}
          >
            <CheckOutlined /> {t('notifications.markAllRead', { defaultValue: 'Đã đọc tất cả' })}
          </button>
        )}
      </div>

      <div className="notification-dropdown__tabs">
        <button
          type="button"
          className={`notification-tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('notifications.all', { defaultValue: 'Tất cả' })} ({items.length})
        </button>
        <button
          type="button"
          className={`notification-tab-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          {t('notifications.unread', { defaultValue: 'Chưa đọc' })} ({unreadCount})
        </button>
      </div>

      <div className="notification-dropdown__list">
        {displayedItems.length > 0 ? (
          displayedItems.map((item: AppNotification) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className={`notification-item ${!item.isRead ? 'notification-item--unread' : ''}`}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleItemClick(item)
                }
              }}
            >
              <div className="notification-item__icon-wrapper">{getNotificationIcon(item.type)}</div>
              <div className="notification-item__body">
                <div className="notification-item__top">
                  <span className="notification-item__title">{item.title}</span>
                  <span className="notification-item__time">{item.createdAt}</span>
                </div>
                <p className="notification-item__content">{item.content}</p>
              </div>
              {!item.isRead && <span className="notification-item__dot" />}
            </div>
          ))
        ) : (
          <div className="notification-dropdown__empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('notifications.empty', { defaultValue: 'Không có thông báo nào' })}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      rootClassName="custom-notification-dropdown-root"
    >
      <button
        type="button"
        className="navbar-icon-btn"
        aria-label={t('notifications.title', { defaultValue: 'Thông báo' })}
      >
        <Badge
          count={unreadCount}
          size="small"
          offset={[-2, 2]}
          styles={{ indicator: { background: '#8cfc70', color: '#043900', fontWeight: 800 } }}
        >
          <BellOutlined className="navbar-icon-btn__icon" />
        </Badge>
      </button>
    </Dropdown>
  )
}
