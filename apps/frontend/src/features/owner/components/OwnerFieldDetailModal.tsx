import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CompassOutlined,
  CopyOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Button, Modal, Popconfirm, Spin, Tag, Tooltip, message } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../fields/field.data'
import { useOwnerFieldDetail } from '../hooks/useOwnerFieldDetail'
import { deactivateField } from '../service/owner.service'
import './OwnerFieldDetailModal.css'

export interface OwnerFieldDetailModalProps {
  open: boolean
  fieldId: string | null
  onClose: () => void
  onDeactivateSuccess?: (fieldId: string) => void
}

export function OwnerFieldDetailModal({
  open,
  fieldId,
  onClose,
  onDeactivateSuccess,
}: OwnerFieldDetailModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { detail, loading, error, fetchFieldDetail, resetDetail } = useOwnerFieldDetail()
  const [deactivating, setDeactivating] = useState(false)

  useEffect(() => {
    if (open && fieldId) {
      void fetchFieldDetail(fieldId)
    } else if (!open) {
      resetDetail()
    }
  }, [open, fieldId, fetchFieldDetail, resetDetail])

  const handleDeactivate = async () => {
    if (!fieldId) return
    try {
      setDeactivating(true)
      await deactivateField(fieldId)
      message.success(t('owner.deactivateSuccess', { defaultValue: 'Đã ngưng hoạt động sân thành công' }))
      onDeactivateSuccess?.(fieldId)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi ngưng hoạt động sân'
      message.error(msg)
    } finally {
      setDeactivating(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text)
    message.success(`Đã sao chép ${label}`)
  }

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

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="offd-modal-header-title">
          <InfoCircleOutlined style={{ color: 'var(--lime)' }} />
          <span>{t('owner.fieldDetailTitle', { defaultValue: 'Chi tiết cụm sân bóng' })}</span>
        </div>
      }
      footer={
        <div className="offd-actions">
          <Button onClick={onClose}>
            {t('common.close', { defaultValue: 'Đóng' })}
          </Button>

          {detail && (
            <>
              {detail.status !== 'inactive' && (
                <Popconfirm
                  title={t('owner.deactivateConfirm', {
                    defaultValue: 'Bạn có chắc chắn muốn ngưng hoạt động cụm sân này?',
                  })}
                  okText={t('common.deactivate', { defaultValue: 'Ngưng hoạt động' })}
                  cancelText={t('common.cancel', { defaultValue: 'Hủy' })}
                  okButtonProps={{ danger: true, loading: deactivating }}
                  onConfirm={handleDeactivate}
                >
                  <Button danger icon={<StopOutlined />} loading={deactivating}>
                    {t('common.deactivate', { defaultValue: 'Ngưng hoạt động' })}
                  </Button>
                </Popconfirm>
              )}

              <Button
                icon={<AppstoreOutlined />}
                onClick={() => {
                  onClose()
                  navigate(`/owner/fields/${detail.id}/courts`)
                }}
              >
                Sân con
              </Button>

              <Button
                icon={<PictureOutlined />}
                onClick={() => {
                  onClose()
                  navigate(`/owner/fields/${detail.id}/images`)
                }}
              >
                Ảnh
              </Button>

              <Button
                icon={<DollarOutlined />}
                onClick={() => {
                  onClose()
                  navigate(`/owner/fields/${detail.id}/pricing`)
                }}
              >
                Bảng giá
              </Button>

              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => {
                  onClose()
                  navigate(`/owner/fields/${detail.id}/opening-hours`)
                }}
              >
                Giờ mở
              </Button>

              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  onClose()
                  navigate(`/owner/fields/${detail.id}/edit`)
                }}
              >
                {t('common.edit', { defaultValue: 'Chỉnh sửa sân' })}
              </Button>
            </>
          )}
        </div>
      }
      className="owner-field-detail-modal"
      destroyOnClose
      centered
      width={680}
    >
      {loading ? (
        <div className="offd-loading">
          <Spin size="large" />
          <p style={{ marginTop: 12, color: 'var(--sage)' }}>
            {t('owner.loadingFieldDetail', { defaultValue: 'Đang tải thông tin chi tiết...' })}
          </p>
        </div>
      ) : error ? (
        <div className="offd-error">
          <Alert
            type="error"
            message={error}
            showIcon
            action={
              <Button size="small" type="primary" onClick={() => fieldId && fetchFieldDetail(fieldId)}>
                {t('common.retry', { defaultValue: 'Thử lại' })}
              </Button>
            }
          />
        </div>
      ) : detail ? (
        <div className="offd-sections">
          {/* Section 1: Thông tin cơ bản */}
          <div>
            <div className="offd-section-title">
              <InfoCircleOutlined /> Thông tin cơ bản
            </div>
            <div className="offd-grid-2col">
              {/* Field 1: Tên cụm sân */}
              <div className="offd-item full-width">
                <span className="offd-label">
                  <span className="offd-label-icon">⚽</span>
                  {t('owner.fieldName', { defaultValue: 'Tên cụm sân' })}
                </span>
                <div className="offd-value-highlight">{detail.name}</div>
              </div>

              {/* Field 2: Trạng thái */}
              <div className="offd-item">
                <span className="offd-label">
                  <CheckCircleFilled className="offd-label-icon" />
                  {t('owner.fieldStatus', { defaultValue: 'Trạng thái vận hành' })}
                </span>
                <div>{renderStatusTag(detail.status)}</div>
              </div>

              {/* Field 3: Mô tả chi tiết */}
              <div className="offd-item full-width">
                <span className="offd-label">
                  <FileTextOutlined className="offd-label-icon" />
                  {t('owner.fieldDescription', { defaultValue: 'Mô tả chi tiết' })}
                </span>
                <div className="offd-value-desc">
                  {detail.description || t('owner.noDescription', { defaultValue: 'Chưa có thông tin mô tả chi tiết.' })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Vị trí & Tọa độ */}
          <div>
            <div className="offd-section-title">
              <EnvironmentOutlined /> Địa điểm & Tọa độ
            </div>
            <div className="offd-grid-2col">
              {/* Field 4: Địa chỉ */}
              <div className="offd-item">
                <span className="offd-label">
                  <EnvironmentOutlined className="offd-label-icon" />
                  {t('owner.fieldAddress', { defaultValue: 'Địa chỉ hoạt động' })}
                </span>
                <div className="offd-value">{detail.address}</div>
              </div>

              {/* Field 5: Quận / Huyện */}
              <div className="offd-item">
                <span className="offd-label">
                  <CompassOutlined className="offd-label-icon" />
                  Quận / Huyện
                </span>
                <div className="offd-value">{detail.district || 'Chưa cập nhật'}</div>
              </div>

              {/* Field 6: Vĩ độ (Lat) */}
              <div className="offd-item">
                <span className="offd-label">
                  <GlobalOutlined className="offd-label-icon" />
                  Vĩ độ (Latitude)
                </span>
                <div className="offd-value">{detail.lat !== null ? detail.lat : 'Chưa xác định'}</div>
              </div>

              {/* Field 7: Kinh độ (Lng) */}
              <div className="offd-item">
                <span className="offd-label">
                  <GlobalOutlined className="offd-label-icon" />
                  Kinh độ (Longitude)
                </span>
                <div className="offd-value">{detail.lng !== null ? detail.lng : 'Chưa xác định'}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Quy định đặt cọc */}
          <div>
            <div className="offd-section-title">
              <SafetyCertificateOutlined /> Quy định đặt cọc
            </div>
            <div className="offd-grid-2col">
              {/* Field 8: Yêu cầu đặt cọc */}
              <div className="offd-item">
                <span className="offd-label">
                  <SafetyCertificateOutlined className="offd-label-icon" />
                  Yêu cầu cọc
                </span>
                <div className="offd-value">
                  {detail.requireDeposit ? (
                    <Tag color="cyan">Có yêu cầu đặt cọc</Tag>
                  ) : (
                    <Tag color="default">Không yêu cầu cọc</Tag>
                  )}
                </div>
              </div>

              {/* Field 9: Hình thức đặt cọc */}
              <div className="offd-item">
                <span className="offd-label">
                  <SafetyCertificateOutlined className="offd-label-icon" />
                  Hình thức cọc
                </span>
                <div className="offd-value">
                  {detail.requireDeposit
                    ? detail.depositType === 'percentage'
                      ? 'Theo tỷ lệ phần trăm (%)'
                      : 'Số tiền cố định (VND)'
                    : 'Không áp dụng'}
                </div>
              </div>

              {/* Field 10: Giá trị tiền cọc */}
              <div className="offd-item full-width">
                <span className="offd-label">
                  <SafetyCertificateOutlined className="offd-label-icon" />
                  Giá trị cọc
                </span>
                <div className="offd-value">
                  {detail.requireDeposit ? (
                    detail.depositType === 'percentage' ? (
                      <strong style={{ color: 'var(--lime)' }}>{detail.depositValue || 0}% tổng giá trị đơn đặt</strong>
                    ) : (
                      <strong style={{ color: 'var(--lime)' }}>{formatPrice(detail.depositValue || 0)}</strong>
                    )
                  ) : (
                    '0 VNĐ'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dữ liệu hệ thống & Định danh */}
          <div>
            <div className="offd-section-title">
              <IdcardOutlined /> Dữ liệu hệ thống
            </div>
            <div className="offd-grid-2col">
              {/* Field 11: ID Cụm sân */}
              <div className="offd-item">
                <span className="offd-label">
                  <IdcardOutlined className="offd-label-icon" />
                  Mã cụm sân (Field ID)
                </span>
                <div className="offd-uuid-row">
                  <span className="offd-uuid-text">{detail.id}</span>
                  <Tooltip title="Sao chép ID cụm sân">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(detail.id, 'Mã cụm sân')}
                    />
                  </Tooltip>
                </div>
              </div>

              {/* Field 12: Owner ID */}
              <div className="offd-item">
                <span className="offd-label">
                  <UserOutlined className="offd-label-icon" />
                  Mã chủ sân (Owner ID)
                </span>
                <div className="offd-uuid-row">
                  <span className="offd-uuid-text">{detail.ownerId}</span>
                  <Tooltip title="Sao chép ID chủ sân">
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(detail.ownerId, 'Mã chủ sân')}
                    />
                  </Tooltip>
                </div>
              </div>

              {/* Field 13: Thời điểm tạo */}
              <div className="offd-item">
                <span className="offd-label">
                  <CalendarOutlined className="offd-label-icon" />
                  Thời điểm tạo
                </span>
                <div className="offd-value">
                  {detail.createdAt ? dayjs(detail.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'Chưa có'}
                </div>
              </div>

              {/* Field 14: Thời điểm cập nhật */}
              <div className="offd-item">
                <span className="offd-label">
                  <ClockCircleOutlined className="offd-label-icon" />
                  Cập nhật gần nhất
                </span>
                <div className="offd-value">
                  {detail.updatedAt ? dayjs(detail.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'Chưa có'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
