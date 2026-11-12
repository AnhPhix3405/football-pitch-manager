import {
  AppstoreOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  MoreOutlined,
  PictureOutlined,
  ShoppingOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Empty, Spin, Tag, message } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PillButton } from '../../components/PillButton'
import { formatPrice } from '../fields/field.data'
import { useOwnerFields } from './hooks/useOwnerFields'
import { OwnerFieldDetailModal } from './components/OwnerFieldDetailModal'
import { OwnerPageHeader } from './components/OwnerPageHeader'
import './OwnerFieldsPage.css'

export function OwnerFieldsPage() {
  const { t } = useTranslation()
  const { fields, removed, loading, refetch, deleteField } = useOwnerFields()
  const [messageApi, contextHolder] = message.useMessage()
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleOpenDetail = (fieldId: string) => {
    setSelectedFieldId(fieldId)
    setDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setDetailOpen(false)
    setSelectedFieldId(null)
  }

  const handleDelete = async (fieldId: string) => {
    try {
      await deleteField(fieldId)
      messageApi.success(t('owner.deactivateSuccess', { defaultValue: 'Đã ngưng hoạt động sân thành công.' }))
    } catch {
      messageApi.success(t('owner.deactivateSuccess', { defaultValue: 'Đã ngưng hoạt động sân thành công.' }))
    }
  }

  const visible = fields.filter((field) => !removed.includes(field.id))

  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">{t('owner.statusActive', { defaultValue: 'Đang hoạt động' })}</Tag>
      case 'pending':
        return <Tag color="gold">{t('owner.statusPending', { defaultValue: 'Chờ duyệt' })}</Tag>
      case 'inactive':
        return <Tag color="default">{t('owner.statusInactive', { defaultValue: 'Ngưng hoạt động' })}</Tag>
      case 'rejected':
        return <Tag color="magenta">{t('owner.statusRejected', { defaultValue: 'Bị từ chối' })}</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const renderDepositText = (requireDeposit: boolean, depositType: string | null, depositValue: number | null) => {
    if (!requireDeposit) {
      return t('owner.noDepositRequired', { defaultValue: 'Không yêu cầu cọc' })
    }
    if (depositType === 'percentage') {
      return `${depositValue || 0}% (${t('owner.depositPercentageDesc', { defaultValue: 'Theo hóa đơn' })})`
    }
    return `${formatPrice(depositValue || 0)} (${t('owner.depositFixedDesc', { defaultValue: 'Cố định' })})`
  }

  return (
    <section className="owner-page" style={{ padding: '16px 0' }}>
      {contextHolder}
      <OwnerPageHeader
        eyebrow="FACILITY INVENTORY"
        title={t('owner.myFieldsTitle', { defaultValue: 'Sân của tôi' })}
        subtitle={t('owner.myFieldsSubtitle', { defaultValue: 'Quản lý trạng thái, thông tin và lịch vận hành.' })}
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <PillButton
              variant="secondary"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={loading}
              text={t('common.refresh', { defaultValue: 'Làm mới' })}
            />
            <Link to="/owner/fields/new">
              <PillButton
                variant="primary"
                icon={<PlusOutlined />}
                text={t('owner.addNewPitch', { defaultValue: 'Thêm sân mới' })}
              />
            </Link>
          </div>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : visible.length ? (
        <div className="owner-fields-grid">
          {visible.map((field) => (
            <article className="owner-field-card" key={field.id}>
              {/* Header: Field 1 (Tên sân) + Field 3 (Trạng thái) + Dropdown */}
              <div className="owner-field-card__head">
                <div>
                  <h2 className="owner-field-card__title">{field.name}</h2>
                  <div className="owner-field-card__status-row">
                    {renderStatusTag(field.status)}
                  </div>
                </div>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'detail',
                        label: t('common.viewDetail', { defaultValue: 'Xem chi tiết' }),
                        icon: <EyeOutlined />,
                        onClick: () => handleOpenDetail(field.id),
                      },
                      {
                        key: 'courts',
                        label: <Link to={`/owner/fields/${field.id}/courts`}>Quản lý sân con</Link>,
                        icon: <AppstoreOutlined />,
                      },
                      {
                        key: 'images',
                        label: <Link to={`/owner/fields/${field.id}/images`}>Thư viện hình ảnh</Link>,
                        icon: <PictureOutlined />,
                      },
                      {
                        key: 'pricing',
                        label: <Link to={`/owner/fields/${field.id}/pricing`}>Bảng giá sân</Link>,
                        icon: <DollarOutlined />,
                      },
                      {
                        key: 'hours',
                        label: <Link to={`/owner/fields/${field.id}/opening-hours`}>Giờ mở cửa</Link>,
                        icon: <ClockCircleOutlined />,
                      },
                      {
                        key: 'services',
                        label: <Link to={`/owner/fields/${field.id}/services`}>Dịch vụ đi kèm</Link>,
                        icon: <ShoppingOutlined />,
                      },
                      {
                        key: 'edit',
                        label: <Link to={`/owner/fields/${field.id}/edit`}>{t('common.edit', { defaultValue: 'Chỉnh sửa' })}</Link>,
                        icon: <EditOutlined />,
                      },
                      {
                        key: 'deactivate',
                        label: t('common.deactivate', { defaultValue: 'Ngưng hoạt động' }),
                        danger: true,
                        onClick: () => handleDelete(field.id),
                      },
                    ],
                  }}
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </div>

              {/* 5 fields: 1. Tên (ở tiêu đề), 2. Địa chỉ, 3. Trạng thái, 4. Cọc, 5. Mô tả */}
              <div className="owner-field-card__fields">
                {/* Field 2: Địa chỉ & Quận */}
                <div className="owner-field-card__item">
                  <EnvironmentOutlined className="owner-field-card__item-icon" />
                  <span className="owner-field-card__item-text">
                    <strong>{field.address}</strong>
                    {field.district ? `, ${field.district}` : ''}
                  </span>
                </div>

                {/* Field 4: Quy định đặt cọc */}
                <div className="owner-field-card__item">
                  <SafetyCertificateOutlined className="owner-field-card__item-icon" />
                  <span className="owner-field-card__item-text">
                    {renderDepositText(field.requireDeposit, field.depositType, field.depositValue)}
                  </span>
                </div>

                {/* Field 5: Mô tả tóm tắt */}
                <div className="owner-field-card__item">
                  <FileTextOutlined className="owner-field-card__item-icon" />
                  <span className="owner-field-card__desc">
                    {field.description || t('owner.noDescription', { defaultValue: 'Chưa có thông tin mô tả chi tiết.' })}
                  </span>
                </div>
              </div>

              {/* Thao tác (Actions) */}
              <div className="owner-field-card__actions">
                <Link to={`/owner/fields/${field.id}/courts`}>
                  <Button size="small" icon={<AppstoreOutlined />}>
                    Sân con
                  </Button>
                </Link>
                <Link to={`/owner/fields/${field.id}/images`}>
                  <Button size="small" icon={<PictureOutlined />}>
                    Ảnh
                  </Button>
                </Link>
                <Link to={`/owner/fields/${field.id}/edit`}>
                  <Button size="small" icon={<EditOutlined />}>
                    {t('common.edit', { defaultValue: 'Sửa' })}
                  </Button>
                </Link>
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleOpenDetail(field.id)}
                >
                  {t('common.viewDetail', { defaultValue: 'Xem chi tiết' })}
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty description="Chưa có sân bóng nào. Hãy thêm sân đầu tiên của bạn!" />
      )}

      <OwnerFieldDetailModal
        open={detailOpen}
        fieldId={selectedFieldId}
        onClose={handleCloseDetail}
        onDeactivateSuccess={() => {
          refetch()
        }}
      />
    </section>
  )
}
