import {
  DashboardOutlined,
  DownOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, type DropdownProps, type MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { signedOut } from '../features/auth/auth.slice'
import { logout } from '../features/auth/service/auth.service'
import { disconnectChatSocket } from '../features/chat/service/chat-socket.service'

interface AccountDropdownProps {
  placement?: DropdownProps['placement']
  variant?: 'header' | 'sidebar'
  showName?: boolean
}

export function AccountDropdown({
  placement = 'bottomRight',
  variant = 'header',
  showName = false,
}: AccountDropdownProps) {
  const { t } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Fallback
    } finally {
      disconnectChatSocket()
      dispatch(signedOut())
      navigate('/auth/login')
    }
  }

  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || t('auth.guest', { defaultValue: 'Khách' })
  const initials = displayName.slice(0, 1).toUpperCase()

  const portalPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/bookings'
  const portalLabel =
    user?.role === 'admin'
      ? t('auth.portalAdmin', { defaultValue: 'Cổng quản trị' })
      : user?.role === 'owner'
        ? t('auth.portalOwner', { defaultValue: 'Quản lý sân bóng' })
        : t('auth.portalPlayer', { defaultValue: 'Lịch đặt & Hoạt động' })

  // Menu items for authenticated user
  const authenticatedMenuItems: MenuProps['items'] = [
    {
      key: 'user-summary',
      disabled: true,
      label: (
        <div className="account-dropdown__info">
          <Avatar
            src={user?.avatarUrl || undefined}
            size={36}
            className="account-dropdown__avatar"
          >
            {initials}
          </Avatar>
          <div className="account-dropdown__user-details">
            <b className="account-dropdown__name">{displayName}</b>
            <span className="account-dropdown__email">{user?.email}</span>
            <span className="account-dropdown__badge">{user?.role?.toUpperCase()}</span>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    ...(user?.role === 'admin' || user?.role === 'owner'
      ? [
          {
            key: 'portal',
            icon: <DashboardOutlined />,
            label: <Link to={portalPath}>{portalLabel}</Link>,
          },
        ]
      : []),
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: (
        <Link to="/profile">
          {t('auth.profileSettings', { defaultValue: 'Cài đặt & Hồ sơ' })}
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: t('auth.logout', { defaultValue: 'Đăng xuất' }),
      onClick: handleLogout,
    },
  ]

  // Menu items for guest
  const guestMenuItems: MenuProps['items'] = [
    {
      key: 'login',
      icon: <LoginOutlined />,
      label: (
        <Link to="/auth/login">{t('auth.login', { defaultValue: 'Đăng nhập' })}</Link>
      ),
    },
    {
      key: 'register',
      icon: <UserAddOutlined />,
      label: (
        <Link to="/auth/register">
          {t('auth.register', { defaultValue: 'Tạo tài khoản mới' })}
        </Link>
      ),
    },
  ]

  if (!user) {
    if (variant === 'sidebar') {
      return (
        <Dropdown
          menu={{ items: guestMenuItems }}
          placement="topCenter"
          arrow={false}
          rootClassName="custom-account-dropdown"
          trigger={['click']}
        >
          <Button type="primary" block className="sidebar-auth-btn">
            <LoginOutlined /> {t('auth.login', { defaultValue: 'Đăng nhập' })}{' '}
            <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
          </Button>
        </Dropdown>
      )
    }

    return (
      <Dropdown
        menu={{ items: guestMenuItems }}
        placement={placement}
        arrow={false}
        rootClassName="custom-account-dropdown"
        trigger={['click']}
      >
        <Button type="primary" className="header-auth-btn">
          {t('auth.login', { defaultValue: 'Đăng nhập' })}{' '}
          <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
        </Button>
      </Dropdown>
    )
  }

  if (variant === 'sidebar') {
    return (
      <Dropdown
        menu={{ items: authenticatedMenuItems }}
        placement="topLeft"
        arrow={false}
        rootClassName="custom-account-dropdown"
        trigger={['click']}
      >
        <div className="sidebar-account" role="button" tabIndex={0}>
          <Avatar
            src={user.avatarUrl || undefined}
            size={32}
            className="sidebar-account__avatar"
          >
            {initials}
          </Avatar>
          <div className="sidebar-account__meta">
            <span className="sidebar-account__name">{displayName}</span>
            <small className="sidebar-account__role">{user.role || 'Member'}</small>
          </div>
          <DownOutlined className="sidebar-account__arrow" />
        </div>
      </Dropdown>
    )
  }

  return (
    <Dropdown
      menu={{ items: authenticatedMenuItems }}
      placement={placement}
      arrow={false}
      rootClassName="custom-account-dropdown"
      trigger={['click']}
    >
      <div
        className="account account--clickable"
        role="button"
        tabIndex={0}
        aria-label={displayName}
      >
        {showName && <span>{displayName}</span>}
        <Avatar
          src={user.avatarUrl || undefined}
          size={32}
          className="account__avatar"
        >
          {initials}
        </Avatar>
        <DownOutlined className="account__arrow" />
      </div>
    </Dropdown>
  )
}
