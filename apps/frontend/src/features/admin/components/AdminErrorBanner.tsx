import { AlertOutlined, ReloadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { AdminErrorBannerProps } from '../interface/admin-overview.interface'

export function AdminErrorBanner({ error, onRetry }: AdminErrorBannerProps) {
  const { t } = useTranslation()

  return (
    <div className="admin-error-banner" role="alert">
      <div className="admin-error-banner__content">
        <AlertOutlined className="admin-error-banner__icon" aria-hidden="true" />
        <span className="admin-error-banner__text">
          {t('admin.loadOverviewError', {
            defaultValue: 'Không thể tải số liệu tổng quan hệ thống.',
          })}{' '}
          <code className="admin-error-banner__code">{error}</code>
        </span>
      </div>
      <button
        type="button"
        className="admin-hud-btn admin-hud-btn--retry"
        onClick={onRetry}
      >
        <ReloadOutlined aria-hidden="true" />
        <span>{t('admin.retryButton', { defaultValue: 'Thử lại' })}</span>
      </button>
    </div>
  )
}
