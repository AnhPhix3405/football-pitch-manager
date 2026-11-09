import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CrownOutlined,
  EditOutlined,
  EyeOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { Button, Modal, Tag } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminSubscriptionPlan } from '../interface/admin-subscription.interface'

interface SubscriptionPlanCardProps {
  plan: AdminSubscriptionPlan
  onEdit: (plan: AdminSubscriptionPlan) => void
  onToggleStatus: (plan: AdminSubscriptionPlan) => void
  onInspect: (plan: AdminSubscriptionPlan) => void
  actionLoading?: boolean
}

export function SubscriptionPlanCard({
  plan,
  onEdit,
  onToggleStatus,
  onInspect,
  actionLoading = false,
}: SubscriptionPlanCardProps) {
  const { t } = useTranslation()

  const formattedPrice = React.useMemo(() => {
    const num = Number(plan.price) || 0
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num)
  }, [plan.price])

  const featureList: string[] = React.useMemo(() => {
    if (plan.benefit && Array.isArray(plan.benefit.features)) {
      return plan.benefit.features as string[]
    }
    return []
  }, [plan.benefit])

  const confirmToggle = () => {
    Modal.confirm({
      title: plan.isActive
        ? t('admin.confirmDeactivatePlanTitle', {
            defaultValue: 'Xác nhận tạm ngưng gói dịch vụ?',
          })
        : t('admin.confirmReactivatePlanTitle', {
            defaultValue: 'Xác nhận kích hoạt lại gói dịch vụ?',
          }),
      content: plan.isActive
        ? t('admin.confirmDeactivatePlanContent', {
            defaultValue:
              'Gói dịch vụ này sẽ bị ẩn khỏi danh sách đăng ký của các đối tác chủ sân.',
          })
        : t('admin.confirmReactivatePlanContent', {
            defaultValue:
              'Gói dịch vụ sẽ mở lại cho tất cả các đối tác chủ sân đăng ký.',
          }),
      okText: plan.isActive
        ? t('admin.deactivate', { defaultValue: 'Tạm ngưng' })
        : t('admin.reactivate', { defaultValue: 'Kích hoạt' }),
      okButtonProps: { danger: plan.isActive },
      cancelText: t('common.cancel', { defaultValue: 'Hủy' }),
      onOk: () => onToggleStatus(plan),
    })
  }

  return (
    <div
      className={`admin-plan-card ${plan.isActive ? 'active' : 'inactive'}`}
      role="article"
      aria-label={plan.name}
    >
      <div className="plan-card-header">
        <div className="plan-title-wrap">
          <div className="plan-icon">
            <CrownOutlined />
          </div>
          <h3 className="plan-name">{plan.name}</h3>
        </div>
        <Tag color={plan.isActive ? 'success' : 'default'} style={{ margin: 0 }}>
          {plan.isActive
            ? t('admin.active', { defaultValue: 'Đang mở' })
            : t('admin.inactive', { defaultValue: 'Tạm ngưng' })}
        </Tag>
      </div>

      <div className="plan-pricing">
        <span className="price-value">{formattedPrice}</span>
        <span className="duration-label">
          / {plan.durationDays} {t('admin.days', { defaultValue: 'ngày' })}
        </span>
      </div>

      <div className="plan-features">
        <span className="features-title">
          {t('admin.benefitsIncluded', { defaultValue: 'Quyền lợi bao gồm:' })}
        </span>
        <ul className="features-list">
          {featureList.length > 0 ? (
            featureList.map((feat, idx) => (
              <li key={idx} className="feature-item">
                <CheckCircleFilled className="feature-icon" />
                <span>{feat}</span>
              </li>
            ))
          ) : (
            <li className="feature-item fallback">
              <span>{t('admin.standardBenefits', { defaultValue: 'Quyền lợi quản lý sân tiêu chuẩn' })}</span>
            </li>
          )}
        </ul>
      </div>

      <div className="plan-card-footer">
        <Button
          size="small"
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onInspect(plan)}
        >
          {t('admin.viewDetail', { defaultValue: 'Chi tiết' })}
        </Button>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(plan)}
          >
            {t('common.edit', { defaultValue: 'Sửa' })}
          </Button>
          <Button
            size="small"
            danger={plan.isActive}
            loading={actionLoading}
            icon={plan.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={confirmToggle}
          >
            {plan.isActive
              ? t('admin.deactivate', { defaultValue: 'Tắt' })
              : t('admin.reactivate', { defaultValue: 'Bật' })}
          </Button>
        </div>
      </div>
    </div>
  )
}
