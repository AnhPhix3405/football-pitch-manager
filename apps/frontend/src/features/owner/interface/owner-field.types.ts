export type OwnerFieldStatus = 'pending' | 'active' | 'inactive' | 'rejected'

export interface OwnerFieldDetail {
  id: string
  ownerId: string
  name: string
  address: string
  district: string | null
  lat: number | null
  lng: number | null
  description: string | null
  status: OwnerFieldStatus | string
  requireDeposit: boolean
  depositType: 'fixed' | 'percentage' | string | null
  depositValue: number | null
  createdAt: string
  updatedAt: string
}

// 1. Quản lý sân con (Courts)
export type CourtType = '5' | '7' | '11'
export type CourtStatus = 'active' | 'inactive' | 'maintenance'

export interface OwnerCourtItem {
  id: string
  fieldId: string
  name: string
  type: CourtType | string
  status: CourtStatus | string
  createdAt: string
  updatedAt: string
}

export interface CreateCourtPayload {
  name: string
  type: CourtType | string
  status?: CourtStatus | string
}

export interface UpdateCourtPayload {
  name?: string
  type?: CourtType | string
  status?: CourtStatus | string
}

export interface CourtQueryParams {
  type?: string
  status?: string
}

// 2. Quản lý thư viện hình ảnh cụm sân (Images)
export interface OwnerImageItem {
  id: string
  fieldId: string
  url: string
  displayOrder: number
  isThumbnail: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateImagePayload {
  url: string
  displayOrder?: number
  isThumbnail?: boolean
}

export interface UpdateImagePayload {
  displayOrder?: number
  isThumbnail?: boolean
}

// 3. Quản lý dịch vụ đi kèm (Services - FIELD-05)
export interface OwnerServiceItem {
  id: string
  fieldId: string
  name: string
  price: number
  unit: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServicePayload {
  name: string
  price: number
  unit?: string
  isActive?: boolean
}

export interface UpdateServicePayload {
  name?: string
  price?: number
  unit?: string
  isActive?: boolean
}

export interface ServiceQueryParams {
  isActive?: boolean
}

// 4. Cấu hình giờ mở cửa theo tuần (Opening Hours - FIELD-06)
export interface FieldOpeningHourItem {
  id?: string
  fieldId?: string
  dayOfWeek: number // 1: Thứ Hai -> 7: Chủ Nhật
  openTime: string // HH:mm hoặc HH:mm:ss
  closeTime: string // HH:mm hoặc HH:mm:ss
  isClosed: boolean
  createdAt?: string
  updatedAt?: string
}

export interface OpeningHourInput {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

export interface UpsertOpeningHoursPayload {
  hours: OpeningHourInput[]
}

// 5. Quản lý khóa lịch sân con chống chồng chéo (Blocked Slots - FIELD-07)
export interface BlockedSlotItem {
  id: string
  fieldCourtId: string
  blockedDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  reason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateBlockedSlotPayload {
  blockedDate: string
  startTime: string
  endTime: string
  reason?: string
}

export interface BlockedSlotQueryParams {
  date?: string
  startDate?: string
  endDate?: string
}

// 6. Quản lý bảng giá & Tình trạng sân (Pricing & Availability - PRICE-01, PRICE-02, AVAIL-01, AVAIL-02, AVAIL-03)
export type DayType = 'weekday' | 'weekend' | 'holiday'

export interface FieldPricingItem {
  id: string
  fieldId: string
  courtType: CourtType | string
  dayType: DayType | string
  startTime: string // HH:mm
  endTime: string // HH:mm
  price: number
  createdAt: string
  updatedAt: string
}

export interface CreatePricingPayload {
  courtType: CourtType | string
  dayType: DayType | string
  startTime: string
  endTime: string
  price: number
}

export interface UpdatePricingPayload {
  courtType?: CourtType | string
  dayType?: DayType | string
  startTime?: string
  endTime?: string
  price?: number
}

export interface PricingQueryParams {
  courtType?: string
  dayType?: string
}

export interface PriceQuoteQuery {
  courtType: string
  date: string
  startTime: string
  endTime: string
}

export interface PriceBreakdownItem {
  startTime: string
  endTime: string
  durationMinutes: number
  slotPrice: number
  subtotal: number
}

export interface PriceQuoteResult {
  fieldId: string
  courtType: string
  date: string
  dayType: string
  startTime: string
  endTime: string
  totalDurationMinutes: number
  totalPrice: number
  breakdown: PriceBreakdownItem[]
}

export interface CheckAvailabilityQuery {
  courtType: string
  date: string
  startTime: string
  endTime: string
}

export interface FieldAvailabilityResult {
  fieldId: string
  date: string
  startTime: string
  endTime: string
  isOpen?: boolean
  isAvailable?: boolean
  availableCourtsCount?: number
  totalCourtsCount?: number
  availableCourtIds?: string[]
  courtTypes?: Array<{
    type: string
    isAvailable: boolean
    availableCourtsCount: number
    totalCourtsCount: number
    availableCourtIds: string[]
  }>
}

export interface CheckAssignmentResult {
  courtId?: string
  valid?: boolean
  canAssign?: boolean
}
