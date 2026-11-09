import type { AdminFieldStatus, AdminFieldStatusFilter } from '../interface/admin-field.interface';

export const ADMIN_FIELD_STATUS_OPTIONS: Array<{
  value: AdminFieldStatusFilter;
  labelKey: string;
  defaultLabel: string;
}> = [
  { value: 'ALL', labelKey: 'adminFields.statusAll', defaultLabel: 'Tất cả trạng thái' },
  { value: 'active', labelKey: 'adminFields.statusActive', defaultLabel: 'Đang hoạt động' },
  { value: 'inactive', labelKey: 'adminFields.statusInactive', defaultLabel: 'Tạm ngưng / Khóa' },
  { value: 'pending', labelKey: 'adminFields.statusPending', defaultLabel: 'Chờ phê duyệt' },
  { value: 'rejected', labelKey: 'adminFields.statusRejected', defaultLabel: 'Bị từ chối' },
];

export const ADMIN_FIELD_STATUS_BADGE_CONFIG: Record<
  AdminFieldStatus,
  { color: string; labelKey: string; defaultLabel: string }
> = {
  active: {
    color: 'success',
    labelKey: 'adminFields.statusActive',
    defaultLabel: 'Đang mở',
  },
  inactive: {
    color: 'default',
    labelKey: 'adminFields.statusInactive',
    defaultLabel: 'Tạm ngưng',
  },
  pending: {
    color: 'warning',
    labelKey: 'adminFields.statusPending',
    defaultLabel: 'Chờ duyệt',
  },
  rejected: {
    color: 'error',
    labelKey: 'adminFields.statusRejected',
    defaultLabel: 'Từ chối',
  },
};

export const COMMON_DISTRICTS = [
  'Quận 1',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Bình Thạnh',
  'Gò Vấp',
  'Phú Nhuận',
  'Tân Bình',
  'Tân Phú',
  'Bình Tân',
  'Thủ Đức',
];
