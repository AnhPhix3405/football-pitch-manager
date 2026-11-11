import { useTranslation } from 'react-i18next'

interface AdminSkeletonGridProps {
  count?: number
}

export function AdminSkeletonGrid({ count = 4 }: AdminSkeletonGridProps) {
  const { t } = useTranslation()

  return (
    <div
      className="admin-skeleton-grid"
      role="status"
      aria-busy="true"
      aria-label={t('admin.loadingOverview', { defaultValue: 'Đang nạp dữ liệu vận hành...' })}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="admin-skeleton-box">
          <div className="admin-skeleton-shimmer" />
        </div>
      ))}
    </div>
  )
}
