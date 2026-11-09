import { Alert, Input, Modal } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminFieldItem } from '../interface/admin-field.interface';

interface FieldStatusModalProps {
  open: boolean;
  field: AdminFieldItem | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (status: 'active' | 'inactive', reason?: string) => Promise<void>;
}

export function FieldStatusModal({
  open,
  field,
  loading,
  onClose,
  onSubmit,
}: FieldStatusModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  if (!field) return null;

  const isLocking = field.status === 'active';
  const targetStatus: 'active' | 'inactive' = isLocking ? 'inactive' : 'active';

  const handleOk = async () => {
    await onSubmit(targetStatus, reason.trim() || undefined);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      open={open}
      title={
        isLocking
          ? t('adminFields.lockConfirmTitle', { defaultValue: 'Xác nhận tạm ngưng cụm sân này?' })
          : t('adminFields.unlockConfirmTitle', { defaultValue: 'Xác nhận kích hoạt lại cụm sân này?' })
      }
      okText={
        isLocking
          ? t('adminFields.lockField', { defaultValue: 'Tạm ngưng sân' })
          : t('adminFields.unlockField', { defaultValue: 'Kích hoạt lại' })
      }
      okButtonProps={{ danger: isLocking, loading }}
      cancelButtonProps={{ disabled: loading }}
      onOk={() => void handleOk()}
      onCancel={handleCancel}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
        <p style={{ margin: 0, color: '#e2e8f0', fontSize: 14 }}>
          <strong>{field.name}</strong> ({field.address})
        </p>

        {isLocking ? (
          <Alert
            type="warning"
            showIcon
            message={t('adminFields.lockConfirmWarning', {
              defaultValue:
                'LƯU Ý: Thao tác này sẽ tự động vô hiệu hóa toàn bộ các sân con thuộc cụm sân và ẩn sân khỏi danh sách đặt công khai.',
            })}
          />
        ) : (
          <Alert
            type="info"
            showIcon
            message={t('adminFields.unlockConfirmContent', {
              defaultValue:
                'Cụm sân sẽ hiển thị trở lại và sẵn sàng tiếp nhận lượt đặt sân từ khách hàng.',
            })}
          />
        )}

        {isLocking && (
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>
              {t('admin.reason', { defaultValue: 'Lý do thực hiện (tùy chọn):' })}
            </label>
            <Input.TextArea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('adminFields.reasonPlaceholder', {
                defaultValue: 'Nhập lý do tạm ngưng sân (tùy chọn)...',
              })}
              maxLength={500}
              showCount
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
