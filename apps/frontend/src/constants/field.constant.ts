export const FIELD_FORMATS = {
  FIVE: '5v5',
  SEVEN: '7v7',
  ELEVEN: '11v11',
} as const

export type FieldFormat = (typeof FIELD_FORMATS)[keyof typeof FIELD_FORMATS]

export const FIELD_SURFACES = {
  ARTIFICIAL: 'Cỏ nhân tạo',
  NATURAL: 'Cỏ tự nhiên',
} as const

export type FieldSurface = (typeof FIELD_SURFACES)[keyof typeof FIELD_SURFACES]

export const HANOI_DISTRICTS = [
  'Hoàn Kiếm',
  'Cầu Giấy',
  'Thanh Xuân',
  'Đống Đa',
  'Nam Từ Liêm',
  'Tây Hồ',
  'Ba Đình',
  'Hai Bà Trưng',
  'Hà Đông',
]

export const HCM_DISTRICTS = [
  'Tân Bình',
  'Quận 1',
  'Quận 3',
  'Quận 7',
  'Bình Thạnh',
  'Thủ Đức',
  'Phú Nhuận',
  'Gò Vấp',
  'Quận 10',
  'Quận 2',
  'Quận 9',
  'Bình Tân',
]

