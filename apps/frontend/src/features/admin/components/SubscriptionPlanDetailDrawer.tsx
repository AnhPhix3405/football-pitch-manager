import {
  CheckCircleFilled,
  CopyOutlined,
  CrownOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { Button, Drawer, Skeleton, Tag, Tooltip, message } from 'antd'
import { useTranslation } from 'react-i18next'
import type { AdminSubscriptionPlan } from '../interface/admin-subscription.interface'

interface SubscriptionPlanDetailDrawerProps {
  open: boolean
  plan: AdminSubscriptionPlan | null
  loading?: boolean
  onClose: () => void
  onEdit: (plan: AdminSubscriptionPlan) => void
  onToggleStatus: (plan: AdminSubscriptionPlan) => void
}

export function SubscriptionPlanDetailDrawer({
  open,
  plan,
  loading = false,
  onClose,
  onEdit,
  onToggleStatus,
}: SubscriptionPlanDetailDrawerProps) {
  const { t } = useTranslation()

  if (!plan && !loading) return null

  const formattedPrice = plan
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(plan.price) || 0)
    : ''

  const featureList: string[] =
    plan && plan.benefit && Array.isArray(plan.benefit.features)
      ? (plan.benefit.features as string[])
      : []

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success(
        `${t('admin.copiedToClipboard', { defaultValue: 'Đã sao chép vào bộ nhớ tạm' })}: ${label}`,
      )
    } catch {
      message.error(
        t('admin.copyFailed', { defaultValue: 'Không thể sao chép' }),
      )
    }
  }

  return (
    <Drawer
      rootClassName="admin-reports-drawer"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CrownOutlined style={{ color: '#10b981', fontSize: 18 }} />
          <span>{plan ? plan.name : t('admin.loading', { defaultValue: 'Đang tải...' })}</span>
          {plan && (
            <Tag
              color={plan.isActive ? 'success' : 'default'}
              style={{ margin: 0, fontSize: 11, fontWeight: 600 }}
            >
              {plan.isActive
                ? t('admin.active', { defaultValue: 'Đang mở' })
                : t('admin.inactive', { defaultValue: 'Tạm ngưng' })}
            </Tag>
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      width={520}
    >
      {loading ? (
        <div style={{ padding: '16px 4px' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : plan ? (
        <>
          <div className="drawer-compact-card">
            <div className="drawer-compact-row">
              <span className="drawer-compact-label">ID GÓI</span>
              <div className="drawer-compact-value">
                <span className="id-text">{plan.id}</span>
                <Tooltip
                  title={t('admin.copyCode', { defaultValue: 'Sao chép ID' })}
                >
                  <Button
                    type="text"
                    size="small"
                    className="copy-action-btn"
                    aria-label="Sao chép ID"
                    icon={<CopyOutlined style={{ fontSize: 12 }} />}
                    onClick={() => void handleCopy(plan.id, 'ID Gói')}
                  />
                </Tooltip>
              </div>
            </div>

            <div className="drawer-compact-row">
              <span className="drawer-compact-label">TÊN GÓI</span>
              <div className="drawer-compact-value" style={{ fontWeight: 600 }}>
                {plan.name}
              </div>
            </div>

            <div className="drawer-compact-row">
              <span className="drawer-compact-label">BIỂU GIÁ</span>
              <div
                className="drawer-compact-value"
                style={{ color: '#38bdf8', fontWeight: 700 }}
              >
                {formattedPrice}
              </div>
            </div>

            <div className="drawer-compact-row">
              <span className="drawer-compact-label">THỜI HẠN</span>
              <div className="drawer-compact-value">
                {plan.durationDays} {t('admin.days', { defaultValue: 'ngày' })}
              </div>
            </div>

            <div className="drawer-compact-row">
              <span className="drawer-compact-label">TRẠNG THÁI</span>
              <div className="drawer-compact-value">
                <Tag color={plan.isActive ? 'green' : 'default'} style={{ margin: 0 }}>
                  {plan.isActive
                    ? t('admin.active', { defaultValue: 'Đang hoạt động' })
                    : t('admin.inactive', { defaultValue: 'Đã tạm ngưng' })}
                </Tag>
              </div>
            </div>

            {plan.createdAt && (
              <div className="drawer-compact-row">
                <span className="drawer-compact-label">NGÀY TẠO</span>
                <div className="drawer-compact-value" style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(plan.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            )}
          </div>

          <div className="drawer-payload-section" style={{ marginBottom: 16 }}>
            <div className="drawer-payload-header">
              <div className="drawer-payload-title">
                <span>DANH SÁCH TÍNH NĂNG ({featureList.length})</span>
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: '#050811' }}>
              {featureList.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {featureList.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#f1f5f9' }}>
                      <CheckCircleFilled style={{ color: '#10b981', fontSize: 14 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: 12 }}>
                  {t('admin.noCustomBenefits', { defaultValue: 'Chưa cấu hình tính năng riêng biệt' })}
                </div>
              )}
            </div>
          </div>

          <div className="drawer-payload-section" style={{ marginBottom: 24 }}>
            <div className="drawer-payload-header">
              <div className="drawer-payload-title">
                <span>CẤU HÌNH DỮ LIỆU</span>
                <span className="json-badge">JSON</span>
              </div>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={() =>
                  void handleCopy(
                    JSON.stringify(plan.benefit ?? {}, null, 2),
                    'JSON Benefit',
                  )
                }
              >
                {t('admin.copyPayload', { defaultValue: 'Sao chép' })}
              </Button>
            </div>
            <pre className="json-viewer-compact">
              {JSON.stringify(plan.benefit ?? {}, null, 2)}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              style={{ flex: 1 }}
              onClick={() => {
                onClose()
                onEdit(plan)
              }}
            >
              {t('common.edit', { defaultValue: 'Chỉnh sửa gói' })}
            </Button>
            <Button
              danger={plan.isActive}
              style={{ flex: 1 }}
              onClick={() => {
                onClose()
                onToggleStatus(plan)
              }}
            >
              {plan.isActive
                ? t('admin.deactivate', { defaultValue: 'Tạm ngưng gói' })
                : t('admin.reactivate', { defaultValue: 'Kích hoạt lại' })}
            </Button>
          </div>
        </>
      ) : null}
    </Drawer>
  )
}
