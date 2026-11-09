import type { SubscriptionPlanStatusFilter } from '../interface/admin-subscription.interface'

export const SUBSCRIPTION_STATUS_FILTER_OPTIONS: {
  label: string
  value: SubscriptionPlanStatusFilter
}[] = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Đã tạm ngưng', value: 'INACTIVE' },
]

export const DURATION_PRESETS = [
  { label: '30 ngày (1 tháng)', value: 30 },
  { label: '90 ngày (3 tháng)', value: 90 },
  { label: '180 ngày (6 tháng)', value: 180 },
  { label: '365 ngày (1 năm)', value: 365 },
]

export const DEFAULT_BENEFIT_SUGGESTIONS = [
  'Quản lý không giới hạn số lượng sân con',
  'Cấu hình bảng giá linh hoạt theo khung giờ cao điểm',
  'Báo cáo doanh thu & xuất dữ liệu chi tiết',
  'Huy hiệu Sân bóng uy tín (Verified Partner)',
  'Hỗ trợ kỹ thuật ưu tiên 24/7',
]
