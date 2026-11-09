import {
  CopyOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Empty, Image, Skeleton, Tag, Tooltip, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { ADMIN_FIELD_STATUS_BADGE_CONFIG } from '../constants/admin-field.constant';
import type { AdminFieldDetail } from '../interface/admin-field.interface';

interface FieldDetailDrawerProps {
  open: boolean;
  field: AdminFieldDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function FieldDetailDrawer({ open, field, loading, onClose }: FieldDetailDrawerProps) {
  const { t } = useTranslation();

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${t('common.copied', { defaultValue: 'Đã sao chép' })}: ${label}`);
    } catch {
      message.error(t('common.copyFailed', { defaultValue: 'Không thể sao chép' }));
    }
  };

  const statusConfig = field ? ADMIN_FIELD_STATUS_BADGE_CONFIG[field.status] : null;

  return (
    <Drawer
      rootClassName="admin-reports-drawer"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShopOutlined style={{ color: '#10b981', fontSize: 18 }} />
          <span>{field ? field.name : t('common.loading', { defaultValue: 'Đang tải...' })}</span>
          {statusConfig && (
            <Tag color={statusConfig.color} style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>
              {t(statusConfig.labelKey, { defaultValue: statusConfig.defaultLabel })}
            </Tag>
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      width={560}
    >
      {loading ? (
        <div style={{ padding: '16px 4px' }}>
          <Skeleton active paragraph={{ rows: 12 }} />
        </div>
      ) : field ? (
        <div className="drawer-dossier-content">
          {/* Section 1: Overview */}
          <div className="drawer-compact-card">
            <div className="drawer-compact-row">
              <span className="drawer-compact-label">{t('adminFields.drawerFieldId', { defaultValue: 'MÃ ĐỊNH DANH (ID)' })}</span>
              <div className="drawer-compact-value">
                <span className="id-text">{field.id}</span>
                <Tooltip title={t('common.copy', { defaultValue: 'Sao chép ID' })}>
                  <Button
                    type="text"
                    size="small"
                    className="copy-action-btn"
                    icon={<CopyOutlined style={{ fontSize: 12 }} />}
                    onClick={() => void handleCopy(field.id, 'Field ID')}
                  />
                </Tooltip>
              </div>
            </div>

            <div className="drawer-compact-row">
              <span className="drawer-compact-label">{t('admin.address', { defaultValue: 'ĐỊA CHỈ' })}</span>
              <div className="drawer-compact-value">
                <EnvironmentOutlined style={{ color: '#10b981', marginRight: 6 }} />
                <span>{field.address}</span>
              </div>
            </div>

            <div className="drawer-compact-row">
              <span className="drawer-compact-label">{t('admin.district', { defaultValue: 'QUẬN / HUYỆN' })}</span>
              <div className="drawer-compact-value">
                <Tag color="cyan" style={{ margin: 0 }}>{field.district || 'N/A'}</Tag>
              </div>
            </div>

            <div className="drawer-compact-row">
              <span className="drawer-compact-label">{t('adminFields.tableColDeposit', { defaultValue: 'CHÍNH SÁCH CỌC' })}</span>
              <div className="drawer-compact-value" style={{ color: '#38bdf8', fontWeight: 600 }}>
                {field.depositFormatted}
              </div>
            </div>

            {field.description && (
              <div className="drawer-compact-row" style={{ alignItems: 'flex-start' }}>
                <span className="drawer-compact-label">{t('admin.description', { defaultValue: 'MÔ TẢ' })}</span>
                <div className="drawer-compact-value" style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                  {field.description}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Owner Contact */}
          <div className="drawer-payload-section" style={{ marginBottom: 16 }}>
            <div className="drawer-payload-header">
              <div className="drawer-payload-title">
                <UserOutlined style={{ marginRight: 6 }} />
                <span>{t('adminFields.drawerOwner', { defaultValue: 'THÔNG TIN CHỦ SÂN' })}</span>
              </div>
            </div>
            <div className="drawer-owner-card">
              <div className="owner-card-item">
                <span className="owner-item-label">{t('common.fullName', { defaultValue: 'Họ và tên:' })}</span>
                <span className="owner-item-value">{field.owner.fullName}</span>
              </div>
              <div className="owner-card-item">
                <span className="owner-item-label">{t('common.email', { defaultValue: 'Email:' })}</span>
                <span className="owner-item-value">
                  <MailOutlined style={{ marginRight: 4, color: '#94a3b8' }} />
                  {field.owner.email}
                </span>
              </div>
              <div className="owner-card-item">
                <span className="owner-item-label">{t('common.phone', { defaultValue: 'Số điện thoại:' })}</span>
                <span className="owner-item-value">
                  <PhoneOutlined style={{ marginRight: 4, color: '#94a3b8' }} />
                  {field.owner.phoneNumber || t('common.notUpdated', { defaultValue: 'Chưa cập nhật' })}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Courts List */}
          <div className="drawer-payload-section" style={{ marginBottom: 16 }}>
            <div className="drawer-payload-header">
              <div className="drawer-payload-title">
                <span>{t('adminFields.drawerCourtsList', { defaultValue: 'DANH SÁCH SÂN CON' })} ({field.courts.length})</span>
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: '#050811' }}>
              {field.courts.length > 0 ? (
                <div className="courts-drawer-grid">
                  {field.courts.map((court) => (
                    <div key={court.id} className="court-drawer-chip">
                      <div className="court-chip-top">
                        <span className="court-chip-name">{court.name}</span>
                        <Tag color={court.status === 'active' ? 'green' : 'default'} style={{ margin: 0, fontSize: 10 }}>
                          {court.status === 'active' ? 'Active' : 'Inactive'}
                        </Tag>
                      </div>
                      <span className="court-chip-badge">Loại sân: {court.type} người</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('adminFields.noCourts', { defaultValue: 'Chưa có sân con nào được cấu hình.' })} />
              )}
            </div>
          </div>

          {/* Section 4: Services */}
          <div className="drawer-payload-section" style={{ marginBottom: 16 }}>
            <div className="drawer-payload-header">
              <div className="drawer-payload-title">
                <span>{t('adminFields.drawerServicesList', { defaultValue: 'DỊCH VỤ ĐI KÈM' })} ({field.services.length})</span>
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: '#050811' }}>
              {field.services.length > 0 ? (
                <div className="services-drawer-list">
                  {field.services.map((svc) => (
                    <div key={svc.id} className="service-drawer-row">
                      <span className="service-row-name">{svc.name}</span>
                      <span className="service-row-price">
                        {new Intl.NumberFormat('vi-VN').format(svc.price)} ₫ / {svc.unit || 'lần'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>
                  {t('adminFields.noServices', { defaultValue: 'Không có dịch vụ đi kèm.' })}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Gallery */}
          <div className="drawer-payload-section" style={{ marginBottom: 20 }}>
            <div className="drawer-payload-header">
              <div className="drawer-payload-title">
                <span>{t('adminFields.drawerGallery', { defaultValue: 'THƯ VIỆN HÌNH ẢNH' })} ({field.images.length})</span>
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: '#050811' }}>
              {field.images.length > 0 ? (
                <Image.PreviewGroup>
                  <div className="gallery-drawer-grid">
                    {field.images.map((img) => (
                      <div key={img.id} className="gallery-thumb-wrap">
                        <Image
                          src={img.url}
                          alt="Pitch image"
                          style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6 }}
                        />
                        {img.isThumbnail && <span className="gallery-primary-badge">Ảnh chính</span>}
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>
                  {t('adminFields.noImages', { defaultValue: 'Chưa có hình ảnh nào được tải lên.' })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
