import { Spin } from 'antd'
import { useTranslation } from 'react-i18next'

export function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <div className="state-screen">
      <Spin size="large" />
      <p>{t('common.loading', { defaultValue: 'Đang thiết lập kết nối...' })}</p>
    </div>
  )
}
