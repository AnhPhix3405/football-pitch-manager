export interface QuickRejectionReason {
  key: string
  labelVi: string
  labelEn: string
  textVi: string
  textEn: string
}

export const OWNER_REJECTION_REASONS: QuickRejectionReason[] = [
  {
    key: 'missing_license',
    labelVi: 'Thiếu GPKD',
    labelEn: 'Missing License',
    textVi: 'Thiếu giấy phép kinh doanh hợp lệ hoặc ảnh chụp giấy phép không rõ ràng.',
    textEn: 'Valid business license is missing or document photo is illegible.',
  },
  {
    key: 'invalid_bank',
    labelVi: 'Sai thông tin ngân hàng',
    labelEn: 'Invalid Bank Details',
    textVi: 'Thông tin số tài khoản hoặc tên chủ tài khoản ngân hàng không trùng khớp với hồ sơ đăng ký.',
    textEn: 'Bank account number or account holder name does not match the registration profile.',
  },
  {
    key: 'unreachable_contact',
    labelVi: 'Không liên hệ được',
    labelEn: 'Cannot Contact',
    textVi: 'Không thể liên hệ với người đại diện theo số điện thoại hoặc email đã cung cấp.',
    textEn: 'Unable to contact the representative via the provided phone number or email.',
  },
  {
    key: 'duplicate_profile',
    labelVi: 'Trùng lặp hồ sơ',
    labelEn: 'Duplicate Profile',
    textVi: 'Hồ sơ chủ sân hoặc cơ sở kinh doanh đã tồn tại trong hệ thống.',
    textEn: 'Owner profile or business facility already exists in the system.',
  },
]

export const FIELD_REJECTION_REASONS: QuickRejectionReason[] = [
  {
    key: 'invalid_address',
    labelVi: 'Sai địa chỉ / vị trí',
    labelEn: 'Invalid Location',
    textVi: 'Địa chỉ cụm sân hoặc tọa độ vị trí trên bản đồ chưa chính xác.',
    textEn: 'Field complex address or map coordinates are inaccurate.',
  },
  {
    key: 'poor_photos',
    labelVi: 'Ảnh sân chưa đạt',
    labelEn: 'Substandard Photos',
    textVi: 'Hình ảnh sân bóng mờ, không chụp thực tế hoặc không đạt tiêu chuẩn kiểm duyệt.',
    textEn: 'Field photos are blurry, non-authentic, or below quality guidelines.',
  },
  {
    key: 'invalid_pricing',
    labelVi: 'Bảng giá chưa hợp lệ',
    labelEn: 'Invalid Pricing',
    textVi: 'Bảng giá theo khung giờ hoặc chính sách đặt cọc chưa rõ ràng.',
    textEn: 'Hourly rate table or deposit policies are unclear.',
  },
  {
    key: 'duplicate_field',
    labelVi: 'Trùng lặp cụm sân',
    labelEn: 'Duplicate Field',
    textVi: 'Cụm sân này đã được đăng ký hoặc đang hoạt động trên hệ thống.',
    textEn: 'This pitch complex has already been registered or is currently active.',
  },
]
