export const DEFAULT_PAGE_SIZE = 10;

export const AUDIT_CATEGORY_OPTIONS = [
  { value: 'ALL', labelKey: 'admin.categoryAll', defaultLabel: 'Tất cả danh mục' },
  { value: 'USER_STATUS', labelKey: 'admin.categoryUserStatus', defaultLabel: 'Trạng thái người dùng' },
  { value: 'APPROVAL', labelKey: 'admin.categoryApproval', defaultLabel: 'Phê duyệt sân / chủ sân' },
  { value: 'MODERATION', labelKey: 'admin.categoryModeration', defaultLabel: 'Kiểm duyệt nội dung' },
  { value: 'PAYMENT', labelKey: 'admin.categoryPayment', defaultLabel: 'Giao dịch thanh toán' },
  { value: 'AUTH', labelKey: 'admin.categoryAuth', defaultLabel: 'Đăng nhập & Phiên' },
  { value: 'SYSTEM', labelKey: 'admin.categorySystem', defaultLabel: 'Tác vụ hệ thống' },
] as const;

export const MODERATION_TYPE_OPTIONS = [
  { value: 'all', labelKey: 'admin.typeAll', defaultLabel: 'Tất cả vi phạm' },
  { value: 'post', labelKey: 'admin.typePost', defaultLabel: 'Bài đăng cộng đồng' },
  { value: 'review', labelKey: 'admin.typeReview', defaultLabel: 'Đánh giá bình luận' },
  { value: 'user', labelKey: 'admin.typeUser', defaultLabel: 'Tài khoản người dùng' },
] as const;

export const MODERATION_STATUS_OPTIONS = [
  { value: 'all', labelKey: 'admin.statusAll', defaultLabel: 'Tất cả trạng thái' },
  { value: 'pending', labelKey: 'admin.statusPending', defaultLabel: 'Chờ xử lý' },
  { value: 'resolved', labelKey: 'admin.statusResolved', defaultLabel: 'Đã giải quyết' },
] as const;

export const AUDIT_ACTION_TAG_CONFIG: Record<
  string,
  { color: string; label: string }
> = {
  SUSPEND_USER: { color: 'error', label: 'Khóa tài khoản' },
  ACTIVATE_USER: { color: 'success', label: 'Mở khóa tài khoản' },
  APPROVE_OWNER: { color: 'cyan', label: 'Duyệt chủ sân' },
  REJECT_OWNER: { color: 'magenta', label: 'Từ chối chủ sân' },
  APPROVE_FIELD: { color: 'blue', label: 'Duyệt sân bóng' },
  REJECT_FIELD: { color: 'volcano', label: 'Từ chối sân bóng' },
  DELETE_POST: { color: 'red', label: 'Gỡ bài đăng' },
  HIDE_REVIEW: { color: 'purple', label: 'Ẩn đánh giá' },
  DISMISS_REVIEW: { color: 'default', label: 'Bỏ qua báo cáo' },
  PAYMENT_RECONCILED: { color: 'green', label: 'Đối soát thanh toán' },
  PAYMENT_REFUNDED: { color: 'gold', label: 'Hoàn tiền giao dịch' },
  USER_LOGIN: { color: 'geekblue', label: 'Đăng nhập' },
  SESSION_REVOKED: { color: 'orange', label: 'Thu hồi phiên' },
};

export const SYSTEM_NODE_FALLBACK: Record<
  string,
  { icon: string; defaultDetail: string }
> = {
  api_gateway: {
    icon: 'api',
    defaultDetail: 'NestJS 11 · Fastify Gateway',
  },
  primary_database: {
    icon: 'database',
    defaultDetail: 'PostgreSQL 16 Cluster',
  },
  cache_cluster: {
    icon: 'redis',
    defaultDetail: 'Redis 7 · BullMQ Queue',
  },
  object_storage: {
    icon: 'cloud',
    defaultDetail: 'Supabase Storage Service',
  },
};
