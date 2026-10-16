import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

export function PlaceholderPage() {
  const { t } = useTranslation()
  const location = useLocation()
  return (
    <section className="placeholder-panel">
      <span className="eyebrow">MODULE QUEUED</span>
      <h1>
        {location.pathname === '/app'
          ? t('nav.commandCenter', { defaultValue: 'Trung tâm điều hành' })
          : t('common.workspace', { defaultValue: 'Không gian chức năng' })}
      </h1>
      <Empty description={t('common.placeholderDesc', { defaultValue: 'Màn hình này sẽ được triển khai trong tác vụ tiếp theo.' })} />
    </section>
  )
}
