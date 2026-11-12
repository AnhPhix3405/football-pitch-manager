import {
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShopOutlined,
  StarFilled,
  UnlockOutlined,
} from '@ant-design/icons';
import {
  Button,
  Input,
  Rate,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { FieldDetailDrawer } from './components/FieldDetailDrawer';
import { FieldKpiCards } from './components/FieldKpiCards';
import { FieldStatusModal } from './components/FieldStatusModal';
import {
  ADMIN_FIELD_STATUS_BADGE_CONFIG,
  ADMIN_FIELD_STATUS_OPTIONS,
  COMMON_DISTRICTS,
} from './constants/admin-field.constant';
import { useAdminFields } from './hooks/useAdminFields';
import type {
  AdminFieldItem,
  AdminFieldStatusFilter,
} from './interface/admin-field.interface';
import './AdminFieldsPage.css';

export function AdminFieldsPage() {
  const { t } = useTranslation();
  const {
    fields,
    total,
    loading,
    kpi,
    kpiLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    districtFilter,
    setDistrictFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    detailDrawerOpen,
    selectedFieldDetail,
    detailLoading,
    statusModalOpen,
    targetField,
    actionLoading,
    openDetailDrawer,
    closeDetailDrawer,
    openStatusModal,
    closeStatusModal,
    handleUpdateStatus,
    refreshData,
  } = useAdminFields();

  const columns: ColumnsType<AdminFieldItem> = [
    {
      title: t('adminFields.tableColName', { defaultValue: 'CỤM SÂN & KHU VỰC' }),
      key: 'name',
      render: (_, record) => (
        <div>
          <div className="field-cell-title">{record.name}</div>
          <div className="field-cell-address">{record.address}</div>
          {record.district && (
            <Tag color="cyan" style={{ marginTop: 4, fontSize: 10, lineHeight: '16px' }}>
              {record.district}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: t('adminFields.tableColOwner', { defaultValue: 'CHỦ SÂN LIÊN HỆ' }),
      key: 'owner',
      render: (_, record) => (
        <div>
          <div className="owner-cell-name">{record.owner.fullName}</div>
          <div className="owner-cell-meta">
            <span>{record.owner.email}</span>
            {record.owner.phoneNumber && <span>{record.owner.phoneNumber}</span>}
          </div>
        </div>
      ),
    },
    {
      title: t('adminFields.tableColCourts', { defaultValue: 'QUY MÔ SÂN CON' }),
      key: 'courts',
      render: (_, record) => (
        <div className="courts-summary-cell">
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
            {record.courtsSummary.total} {t('common.courts', { defaultValue: 'sân' })}
          </span>
          <div className="courts-type-badges">
            {record.courtsSummary.type5 > 0 && (
              <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                {record.courtsSummary.type5}x 5
              </Tag>
            )}
            {record.courtsSummary.type7 > 0 && (
              <Tag color="purple" style={{ margin: 0, fontSize: 10 }}>
                {record.courtsSummary.type7}x 7
              </Tag>
            )}
            {record.courtsSummary.type11 > 0 && (
              <Tag color="green" style={{ margin: 0, fontSize: 10 }}>
                {record.courtsSummary.type11}x 11
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('adminFields.tableColDeposit', { defaultValue: 'CHÍNH SÁCH CỌC' }),
      key: 'deposit',
      render: (_, record) => (
        <div>
          <div style={{ color: record.requireDeposit ? '#38bdf8' : '#94a3b8', fontWeight: 500 }}>
            {record.depositFormatted}
          </div>
          <Tag color={record.requireDeposit ? 'processing' : 'default'} style={{ marginTop: 4, fontSize: 10 }}>
            {record.requireDeposit ? t('common.depositRequired', { defaultValue: 'Bắt buộc cọc' }) : t('common.noDeposit', { defaultValue: 'Không cọc' })}
          </Tag>
        </div>
      ),
    },
    {
      title: t('adminFields.tableColRating', { defaultValue: 'ĐÁNH GIÁ UY TÍN' }),
      key: 'rating',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Rate
              disabled
              allowHalf
              value={record.ratingSummary.bayesianRating > 0 ? record.ratingSummary.bayesianRating : record.ratingSummary.averageRating}
              character={<StarFilled style={{ fontSize: 12 }} />}
              style={{ color: '#fbbf24' }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>
              {(record.ratingSummary.bayesianRating > 0 ? record.ratingSummary.bayesianRating : record.ratingSummary.averageRating).toFixed(1)}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            {record.ratingSummary.totalReviews} {t('common.reviews', { defaultValue: 'đánh giá' })}
          </span>
        </div>
      ),
    },
    {
      title: t('adminFields.tableColStatus', { defaultValue: 'TRẠNG THÁI' }),
      key: 'status',
      render: (_, record) => {
        const config = ADMIN_FIELD_STATUS_BADGE_CONFIG[record.status];
        return (
          <Tag color={config.color} style={{ fontWeight: 600, fontSize: 12 }}>
            {t(config.labelKey, { defaultValue: config.defaultLabel })}
          </Tag>
        );
      },
    },
    {
      title: t('adminFields.tableColActions', { defaultValue: 'THAO TÁC' }),
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('adminFields.viewDetails', { defaultValue: 'Xem chi tiết hồ sơ' })}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: '#38bdf8' }} />}
              onClick={() => void openDetailDrawer(record)}
            />
          </Tooltip>

          {record.status === 'active' ? (
            <Tooltip title={t('adminFields.lockField', { defaultValue: 'Tạm ngưng cụm sân' })}>
              <Button
                type="text"
                size="small"
                danger
                icon={<LockOutlined />}
                onClick={() => openStatusModal(record)}
              />
            </Tooltip>
          ) : record.status === 'inactive' ? (
            <Tooltip title={t('adminFields.unlockField', { defaultValue: 'Kích hoạt lại cụm sân' })}>
              <Button
                type="text"
                size="small"
                style={{ color: '#10b981' }}
                icon={<UnlockOutlined />}
                onClick={() => openStatusModal(record)}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <section className="admin-fields-page">
      {/* Page Header */}
      <div className="admin-fields-header">
        <h1 className="admin-fields-title">
          <ShopOutlined style={{ color: 'var(--hud-accent-lime, #8cfc70)' }} />
          {t('adminFields.title', { defaultValue: 'Quản lý Sân bóng Hệ thống' })}
        </h1>
        <p className="admin-fields-subtitle">
          {t('adminFields.subtitle', {
            defaultValue: 'Tra cứu, theo dõi KPI và điều phối trạng thái hoạt động của tất cả các cụm sân trên toàn hệ thống.',
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <FieldKpiCards kpi={kpi} loading={kpiLoading} />

      {/* Toolbar */}
      <div className="admin-fields-toolbar">
        <div className="admin-fields-toolbar-left">
          <Input
            prefix={<SearchOutlined style={{ color: '#64748b' }} />}
            placeholder={t('adminFields.searchPlaceholder', {
              defaultValue: 'Tìm kiếm theo tên sân, địa chỉ, tên hoặc email chủ sân...',
            })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 340 }}
          />

          <Segmented<AdminFieldStatusFilter>
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={ADMIN_FIELD_STATUS_OPTIONS.map((opt) => ({
              label: t(opt.labelKey, { defaultValue: opt.defaultLabel }),
              value: opt.value,
            }))}
          />

          <Select
            allowClear
            placeholder={t('adminFields.districtPlaceholder', { defaultValue: 'Lọc theo Quận/Huyện' })}
            value={districtFilter}
            onChange={(val) => {
              setDistrictFilter(val);
              setPage(1);
            }}
            style={{ width: 170 }}
            options={COMMON_DISTRICTS.map((d) => ({ label: d, value: d }))}
          />
        </div>

        <div className="admin-fields-toolbar-right">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void refreshData()}
            loading={loading}
          >
            {t('common.refresh', { defaultValue: 'Làm mới' })}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-fields-table-wrap">
        <Table<AdminFieldItem>
          rowKey="id"
          columns={columns}
          dataSource={fields}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </div>

      {/* Detail Drawer */}
      <FieldDetailDrawer
        open={detailDrawerOpen}
        field={selectedFieldDetail}
        loading={detailLoading}
        onClose={closeDetailDrawer}
      />

      {/* Status Modal */}
      <FieldStatusModal
        open={statusModalOpen}
        field={targetField}
        loading={actionLoading}
        onClose={closeStatusModal}
        onSubmit={handleUpdateStatus}
      />
    </section>
  );
}
