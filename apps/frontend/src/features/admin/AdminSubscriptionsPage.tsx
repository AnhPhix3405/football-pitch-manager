import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TableOutlined,
} from '@ant-design/icons'
import {
  Button,
  Empty,
  Input,
  Modal,
  Segmented,
  Skeleton,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { SubscriptionPlanCard } from './components/SubscriptionPlanCard'
import { SubscriptionPlanDetailDrawer } from './components/SubscriptionPlanDetailDrawer'
import { SubscriptionPlanFormModal } from './components/SubscriptionPlanFormModal'
import { SUBSCRIPTION_STATUS_FILTER_OPTIONS } from './constants/admin-subscription.constant'
import { useAdminSubscriptions } from './hooks/useAdminSubscriptions'
import type {
  AdminSubscriptionPlan,
  CreateSubscriptionPlanPayload,
  SubscriptionPlanStatusFilter,
  SubscriptionPlanViewMode,
} from './interface/admin-subscription.interface'
import './AdminSubscriptionsPage.css'

export function AdminSubscriptionsPage() {
  const { t } = useTranslation()
  const {
    plans,
    allPlansCount,
    loading,
    detailLoading,
    actionLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    kpiMetrics,
    modalVisible,
    modalMode,
    selectedPlan,
    drawerVisible,
    inspectedPlan,
    fetchPlans,
    openCreateModal,
    openEditModal,
    closeModal,
    openDetailDrawer,
    closeDetailDrawer,
    handleCreatePlan,
    handleUpdatePlan,
    handleToggleStatus,
  } = useAdminSubscriptions()

  const confirmToggleFromTable = (plan: AdminSubscriptionPlan) => {
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
      onOk: () => handleToggleStatus(plan),
    })
  }

  const tableColumns: ColumnsType<AdminSubscriptionPlan> = [
    {
      title: t('admin.planName', { defaultValue: 'TÊN GÓI' }),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CrownOutlined style={{ color: '#10b981' }} />
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{text}</span>
        </div>
      ),
    },
    {
      title: t('admin.planPrice', { defaultValue: 'BIỂU GIÁ' }),
      dataIndex: 'price',
      key: 'price',
      render: (val: string | number) => {
        const num = Number(val) || 0
        return (
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(num)}
          </span>
        )
      },
    },
    {
      title: t('admin.planDuration', { defaultValue: 'THỜI HẠN' }),
      dataIndex: 'durationDays',
      key: 'durationDays',
      render: (days: number) => (
        <span>
          {days} {t('admin.days', { defaultValue: 'ngày' })}
        </span>
      ),
    },
    {
      title: t('admin.planBenefits', { defaultValue: 'QUYỀN LỢI' }),
      key: 'benefits',
      render: (_: unknown, record: AdminSubscriptionPlan) => {
        const features =
          record.benefit && Array.isArray(record.benefit.features)
            ? (record.benefit.features as string[])
            : []
        if (features.length === 0) {
          return <span style={{ color: '#94a3b8', fontSize: 12 }}>Tiêu chuẩn</span>
        }
        return (
          <span style={{ fontSize: 12.5, color: '#e2e8f0' }}>
            {features[0]}
            {features.length > 1 && (
              <Tag style={{ marginLeft: 6, fontSize: 11 }}>+{features.length - 1}</Tag>
            )}
          </span>
        )
      },
    },
    {
      title: t('admin.status', { defaultValue: 'TRẠNG THÁI' }),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive
            ? t('admin.active', { defaultValue: 'Đang mở' })
            : t('admin.inactive', { defaultValue: 'Tạm ngưng' })}
        </Tag>
      ),
    },
    {
      title: t('admin.actions', { defaultValue: 'THAO TÁC' }),
      key: 'actions',
      render: (_: unknown, record: AdminSubscriptionPlan) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tooltip title={t('admin.viewDetail', { defaultValue: 'Chi tiết' })}>
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDetailDrawer(record)}
            />
          </Tooltip>
          <Tooltip title={t('common.edit', { defaultValue: 'Chỉnh sửa' })}>
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip
            title={
              record.isActive
                ? t('admin.deactivate', { defaultValue: 'Tắt hoạt động' })
                : t('admin.reactivate', { defaultValue: 'Kích hoạt lại' })
            }
          >
            <Button
              size="small"
              type="text"
              danger={record.isActive}
              icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => confirmToggleFromTable(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <section className="admin-subscriptions-page" aria-label="Quản trị gói dịch vụ">
      <header className="page-header">
        <div>
          <span className="eyebrow">
            {t('admin.governanceCategory', { defaultValue: 'QUẢN TRỊ DỊCH VỤ' })}
          </span>
          <h1 className="page-title">
            {t('admin.subscriptionsTitle', { defaultValue: 'Gói Dịch Vụ Hội Viên' })}
          </h1>
          <p className="page-description">
            {t('admin.subscriptionsDesc', {
              defaultValue:
                'Cấu hình danh mục gói dịch vụ, biểu giá thuê bao và tính năng quyền lợi dành cho các đối tác chủ sân.',
            })}
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="create-plan-btn"
          onClick={openCreateModal}
        >
          {t('admin.createPlan', { defaultValue: 'Thêm gói dịch vụ mới' })}
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="subscriptions-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">
            {t('admin.kpiTotalPlans', { defaultValue: 'TỔNG SỐ GÓI' })}
          </span>
          <span className="kpi-value">{kpiMetrics.total}</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            {t('admin.kpiActivePlans', { defaultValue: 'ĐANG MỞ ĐĂNG KÝ' })}
          </span>
          <span className="kpi-value" style={{ color: '#10b981' }}>
            {kpiMetrics.active}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            {t('admin.kpiInactivePlans', { defaultValue: 'TẠM NGƯNG HOẠT ĐỘNG' })}
          </span>
          <span className="kpi-value" style={{ color: '#94a3b8' }}>
            {kpiMetrics.inactive}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">
            {t('admin.kpiPriceRange', { defaultValue: 'PHỔ GIÁ GÓI' })}
          </span>
          <span className="kpi-value" style={{ fontSize: 18, color: '#38bdf8' }}>
            {new Intl.NumberFormat('vi-VN').format(kpiMetrics.minPrice)} -{' '}
            {new Intl.NumberFormat('vi-VN').format(kpiMetrics.maxPrice)} đ
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="subscriptions-toolbar">
        <div className="toolbar-left">
          <Input
            placeholder={t('admin.searchPlanPlaceholder', {
              defaultValue: 'Tìm kiếm gói dịch vụ theo tên...',
            })}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />

          <Segmented
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as SubscriptionPlanStatusFilter)}
            options={SUBSCRIPTION_STATUS_FILTER_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
          />
        </div>

        <div className="toolbar-right">
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as SubscriptionPlanViewMode)}
            options={[
              { value: 'grid', icon: <AppstoreOutlined /> },
              { value: 'table', icon: <TableOutlined /> },
            ]}
          />

          <Tooltip title={t('common.refresh', { defaultValue: 'Làm mới' })}>
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => void fetchPlans()}
            />
          </Tooltip>
        </div>
      </div>

      {/* Content View */}
      {loading && allPlansCount === 0 ? (
        <Skeleton active paragraph={{ rows: 6 }} style={{ padding: 24 }} />
      ) : plans.length === 0 ? (
        <div className="empty-wrap">
          <Empty
            description={t('admin.noPlansFound', {
              defaultValue: 'Không tìm thấy gói dịch vụ nào phù hợp.',
            })}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('admin.createFirstPlan', { defaultValue: 'Tạo gói đầu tiên' })}
            </Button>
          </Empty>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="plans-grid">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              onEdit={openEditModal}
              onToggleStatus={handleToggleStatus}
              onInspect={openDetailDrawer}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      ) : (
        <div className="plans-table-wrap">
          <Table
            columns={tableColumns}
            dataSource={plans}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </div>
      )}

      {/* Modals & Drawer */}
      <SubscriptionPlanFormModal
        open={modalVisible}
        mode={modalMode}
        initialData={selectedPlan}
        onClose={closeModal}
        onSubmit={async (payload) => {
          if (modalMode === 'create') {
            await handleCreatePlan(payload as CreateSubscriptionPlanPayload)
          } else if (selectedPlan) {
            await handleUpdatePlan(selectedPlan.id, payload)
          }
        }}
        loading={actionLoading}
      />

      <SubscriptionPlanDetailDrawer
        open={drawerVisible}
        plan={inspectedPlan}
        loading={detailLoading}
        onClose={closeDetailDrawer}
        onEdit={openEditModal}
        onToggleStatus={handleToggleStatus}
      />
    </section>
  )
}
