import {
  CheckCircleFilled,
  ReloadOutlined,
  WarningFilled,
} from '@ant-design/icons'
import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { AdminCommandHeaderProps } from '../interface/admin-overview.interface'

export function AdminCommandHeader({
  systemHealth,
  isLoading,
  isRefreshing,
  onRefresh,
}: AdminCommandHeaderProps) {
  const { t } = useTranslation()
  const isOperational = systemHealth?.status !== 'degraded'

  return (
    <header className="admin-command-header">
      <div className="admin-command-header__intro">
        <div className="admin-command-header__badges">
          <span className="admin-hud-eyebrow">
            <span className="admin-hud-pulse-dot" aria-hidden="true" />
            {t('admin.commandCenterEyebrow', { defaultValue: 'SYSTEM COMMAND CENTER' })}
          </span>
          <span className="admin-hud-live-tag">
            {t('admin.livePulse', { defaultValue: 'LIVE' })}
          </span>
        </div>
        <h1 className="admin-command-header__title">
          {t('admin.dashboardTitle', { defaultValue: 'Command Center' })}
        </h1>
        <p className="admin-command-header__subtitle">
          {t('admin.dashboardSubtitle', {
            defaultValue: 'Toàn cảnh vận hành mạng lưới PitchMaster.',
          })}
        </p>
      </div>

      <div className="admin-command-header__actions" role="toolbar" aria-label="Command Center Actions">
        <Tag
          className={`admin-status-badge ${
            isOperational ? 'admin-status-badge--operational' : 'admin-status-badge--degraded'
          }`}
          color={isOperational ? 'green' : 'orange'}
        >
          {isOperational ? <CheckCircleFilled /> : <WarningFilled />}
          <span>
            {isOperational
              ? t('admin.statusOperational', {
                  defaultValue: 'ALL SYSTEMS OPERATIONAL',
                })
              : t('admin.statusDegraded', {
                  defaultValue: 'SYSTEM DEGRADED',
                })}
          </span>
        </Tag>

        <button
          type="button"
          className="admin-hud-btn"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          aria-label={t('admin.refreshData', { defaultValue: 'Làm mới dữ liệu' })}
        >
          <ReloadOutlined spin={isRefreshing} aria-hidden="true" />
          <span>{t('admin.refreshData', { defaultValue: 'Làm mới' })}</span>
        </button>
      </div>
    </header>
  )
}
