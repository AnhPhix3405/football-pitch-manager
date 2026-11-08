import type {
  BlockedSlotItem,
  BlockedSlotQueryParams,
  CheckAvailabilityQuery,
  CourtQueryParams,
  CreateBlockedSlotPayload,
  CreateCourtPayload,
  CreateImagePayload,
  CreatePricingPayload,
  CreateServicePayload,
  FieldAvailabilityResult,
  FieldOpeningHourItem,
  FieldPricingItem,
  OwnerCourtItem,
  OwnerImageItem,
  OwnerServiceItem,
  PriceQuoteQuery,
  PriceQuoteResult,
  PricingQueryParams,
  ServiceQueryParams,
  UpdateCourtPayload,
  UpdateImagePayload,
  UpdatePricingPayload,
  UpdateServicePayload,
  UpsertOpeningHoursPayload,
} from '../interface/owner-field.types'
import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type { BackendFieldItem, BackendFieldListResponse } from '../../fields/service/field.service'
import type {
  OwnerBooking,
  OwnerBookingListResponse,
  OwnerBookingQuery,
  OwnerCourt,
  OwnerCourtTimeline,
} from '../interface/owner-booking.types'

export interface RegisterOwnerPayload {
  businessName: string
  businessLicense: string
  bankAccount: string
  note?: string
}

export interface OwnerRegistrationRequestItem {
  id: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  note?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface OwnerRegistrationStatusResponse {
  hasPendingRequest: boolean
  currentRole: string
  latestRequest: OwnerRegistrationRequestItem | null
  profile: OwnerProfileResponse | null
}

export interface OwnerProfileResponse {
  id: string
  userId: string
  businessName: string
  businessLicense: string
  bankAccount: string
  note?: string | null
}

export interface CreateFieldPayload {
  name: string
  address: string
  district?: string
  lat?: number
  lng?: number
  description?: string
  requireDeposit?: boolean
  depositType?: 'fixed' | 'percentage'
  depositValue?: number
}

export interface UpdateFieldPayload extends Partial<CreateFieldPayload> {
  status?: 'pending' | 'active' | 'inactive' | 'rejected'
}

export interface OwnerFieldQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

// 1. Đăng ký chủ sân & xem trạng thái
export async function registerOwner(payload: RegisterOwnerPayload): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>('/owner-registration', payload)
}

export async function getRegistrationStatus(): Promise<OwnerRegistrationStatusResponse> {
  const response = await apiClient.get<ApiResponse<OwnerRegistrationStatusResponse>>('/owner-registration/status')
  return response.data.data
}

// 2. Hồ sơ chủ sân
export async function getMyProfile(): Promise<OwnerProfileResponse> {
  const response = await apiClient.get<ApiResponse<OwnerProfileResponse>>('/owner-profiles/me')
  return response.data.data
}

export async function updateMyProfile(payload: Partial<RegisterOwnerPayload>): Promise<OwnerProfileResponse> {
  const response = await apiClient.patch<ApiResponse<OwnerProfileResponse>>('/owner-profiles/me', payload)
  return response.data.data
}

// 3. Quản lý sân của chủ sân
export async function getOwnerFields(params?: OwnerFieldQueryParams): Promise<BackendFieldListResponse> {
  const response = await apiClient.get<ApiResponse<BackendFieldListResponse>>('/owner/fields', { params })
  return response.data.data
}

export async function getOwnerFieldDetail(id: string): Promise<BackendFieldItem> {
  const response = await apiClient.get<ApiResponse<BackendFieldItem>>(`/owner/fields/${id}`)
  return response.data.data
}

export async function createField(payload: CreateFieldPayload): Promise<BackendFieldItem> {
  const response = await apiClient.post<ApiResponse<BackendFieldItem>>('/owner/fields', payload)
  return response.data.data
}

export async function updateField(id: string, payload: UpdateFieldPayload): Promise<BackendFieldItem> {
  const response = await apiClient.patch<ApiResponse<BackendFieldItem>>(`/owner/fields/${id}`, payload)
  return response.data.data
}

export async function deactivateField(id: string): Promise<BackendFieldItem> {
  const response = await apiClient.delete<ApiResponse<BackendFieldItem>>(`/owner/fields/${id}`)
  return response.data.data
}

export async function getOwnerBookings(fieldId: string, params: OwnerBookingQuery = {}): Promise<OwnerBookingListResponse> {
  const response = await apiClient.get<ApiResponse<OwnerBookingListResponse>>(
    `/owner/fields/${fieldId}/bookings`,
    { params },
  )
  return response.data.data
}

export async function getOwnerBookingDetail(fieldId: string, bookingId: string): Promise<OwnerBooking> {
  const response = await apiClient.get<ApiResponse<OwnerBooking>>(
    `/owner/fields/${fieldId}/bookings/${bookingId}`,
  )
  return response.data.data
}

export async function getOwnerCourts(fieldId: string, type?: string): Promise<OwnerCourt[]> {
  const response = await apiClient.get<ApiResponse<OwnerCourt[]>>(
    `/owner/fields/${fieldId}/courts`,
    { params: { type, status: 'active' } },
  )
  return response.data.data
}

export async function checkCourtAssignment(
  fieldId: string,
  courtId: string,
  params: { courtType: string; date: string; startTime: string; endTime: string },
): Promise<{ valid: boolean }> {
  const response = await apiClient.get<ApiResponse<{ valid: boolean }>>(
    `/owner/fields/${fieldId}/courts/${courtId}/check-assignment`,
    { params },
  )
  return response.data.data
}

export async function confirmOwnerBooking(
  fieldId: string,
  bookingId: string,
  payload: { fieldCourtId: string; note?: string },
): Promise<OwnerBooking> {
  const response = await apiClient.post<ApiResponse<OwnerBooking>>(
    `/owner/fields/${fieldId}/bookings/${bookingId}/confirm`,
    payload,
  )
  return response.data.data
}

export async function rejectOwnerBooking(fieldId: string, bookingId: string, reason: string): Promise<OwnerBooking> {
  const response = await apiClient.post<ApiResponse<OwnerBooking>>(
    `/owner/fields/${fieldId}/bookings/${bookingId}/reject`,
    { reason },
  )
  return response.data.data
}

export async function completeOwnerBooking(fieldId: string, bookingId: string): Promise<OwnerBooking> {
  const response = await apiClient.post<ApiResponse<OwnerBooking>>(
    `/owner/fields/${fieldId}/bookings/${bookingId}/complete`,
  )
  return response.data.data
}

export async function getOwnerCourtTimeline(fieldId: string, date: string): Promise<OwnerCourtTimeline> {
  const response = await apiClient.get<ApiResponse<OwnerCourtTimeline>>(
    `/owner/fields/${fieldId}/courts/timeline`,
    { params: { date } },
  )
  return response.data.data
}

// 4. Quản lý sân con (Courts - FIELD-03)
export async function createOwnerCourt(fieldId: string, payload: CreateCourtPayload): Promise<OwnerCourtItem> {
  const response = await apiClient.post<ApiResponse<OwnerCourtItem>>(`/owner/fields/${fieldId}/courts`, payload);
  return response.data.data;
}

export async function getOwnerCourtsList(fieldId: string, params?: CourtQueryParams): Promise<OwnerCourtItem[]> {
  const response = await apiClient.get<ApiResponse<OwnerCourtItem[]>>(`/owner/fields/${fieldId}/courts`, { params });
  return response.data.data;
}

export async function getOwnerCourtDetail(fieldId: string, courtId: string): Promise<OwnerCourtItem> {
  const response = await apiClient.get<ApiResponse<OwnerCourtItem>>(`/owner/fields/${fieldId}/courts/${courtId}`);
  return response.data.data;
}

export async function updateOwnerCourt(fieldId: string, courtId: string, payload: UpdateCourtPayload): Promise<OwnerCourtItem> {
  const response = await apiClient.patch<ApiResponse<OwnerCourtItem>>(`/owner/fields/${fieldId}/courts/${courtId}`, payload);
  return response.data.data;
}

export async function deleteOwnerCourt(fieldId: string, courtId: string): Promise<OwnerCourtItem> {
  const response = await apiClient.delete<ApiResponse<OwnerCourtItem>>(`/owner/fields/${fieldId}/courts/${courtId}`);
  return response.data.data;
}

// 5. Quản lý thư viện hình ảnh cụm sân (Images - FIELD-04)
export async function addOwnerImage(fieldId: string, payload: CreateImagePayload): Promise<OwnerImageItem> {
  const response = await apiClient.post<ApiResponse<OwnerImageItem>>(`/owner/fields/${fieldId}/images`, payload);
  return response.data.data;
}

export async function getOwnerImages(fieldId: string): Promise<OwnerImageItem[]> {
  const response = await apiClient.get<ApiResponse<OwnerImageItem[]>>(`/owner/fields/${fieldId}/images`);
  return response.data.data;
}

export async function updateOwnerImage(fieldId: string, imageId: string, payload: UpdateImagePayload): Promise<OwnerImageItem> {
  const response = await apiClient.patch<ApiResponse<OwnerImageItem>>(`/owner/fields/${fieldId}/images/${imageId}`, payload);
  return response.data.data;
}

export async function deleteOwnerImage(fieldId: string, imageId: string): Promise<OwnerImageItem> {
  const response = await apiClient.delete<ApiResponse<OwnerImageItem>>(`/owner/fields/${fieldId}/images/${imageId}`);
  return response.data.data;
}

// 6. Quản lý dịch vụ đi kèm (Services - FIELD-05)
export async function createOwnerService(fieldId: string, payload: CreateServicePayload): Promise<OwnerServiceItem> {
  const response = await apiClient.post<ApiResponse<OwnerServiceItem>>(`/owner/fields/${fieldId}/services`, payload);
  return response.data.data;
}

export async function getOwnerServices(fieldId: string, params?: ServiceQueryParams): Promise<OwnerServiceItem[]> {
  const response = await apiClient.get<ApiResponse<OwnerServiceItem[]>>(`/owner/fields/${fieldId}/services`, { params });
  return response.data.data;
}

export async function updateOwnerService(fieldId: string, serviceId: string, payload: UpdateServicePayload): Promise<OwnerServiceItem> {
  const response = await apiClient.patch<ApiResponse<OwnerServiceItem>>(`/owner/fields/${fieldId}/services/${serviceId}`, payload);
  return response.data.data;
}

export async function deleteOwnerService(fieldId: string, serviceId: string): Promise<OwnerServiceItem> {
  const response = await apiClient.delete<ApiResponse<OwnerServiceItem>>(`/owner/fields/${fieldId}/services/${serviceId}`);
  return response.data.data;
}

// 7. Cấu hình giờ mở cửa theo tuần (Opening Hours - FIELD-06)
export async function upsertOwnerOpeningHours(fieldId: string, payload: UpsertOpeningHoursPayload): Promise<FieldOpeningHourItem[]> {
  const response = await apiClient.put<ApiResponse<FieldOpeningHourItem[]>>(`/owner/fields/${fieldId}/opening-hours`, payload);
  return response.data.data;
}

export async function getOwnerOpeningHours(fieldId: string): Promise<FieldOpeningHourItem[]> {
  const response = await apiClient.get<ApiResponse<FieldOpeningHourItem[]>>(`/owner/fields/${fieldId}/opening-hours`);
  return response.data.data;
}

// 8. Quản lý khóa lịch sân con chống chồng chéo (Blocked Slots - FIELD-07)
export async function createOwnerBlockedSlot(fieldId: string, courtId: string, payload: CreateBlockedSlotPayload): Promise<BlockedSlotItem> {
  const response = await apiClient.post<ApiResponse<BlockedSlotItem>>(`/owner/fields/${fieldId}/courts/${courtId}/blocked-slots`, payload);
  return response.data.data;
}

export async function getOwnerBlockedSlots(fieldId: string, courtId: string, params?: BlockedSlotQueryParams): Promise<BlockedSlotItem[]> {
  const response = await apiClient.get<ApiResponse<BlockedSlotItem[]>>(`/owner/fields/${fieldId}/courts/${courtId}/blocked-slots`, { params });
  return response.data.data;
}

export async function deleteOwnerBlockedSlot(fieldId: string, courtId: string, slotId: string): Promise<BlockedSlotItem> {
  const response = await apiClient.delete<ApiResponse<BlockedSlotItem>>(`/owner/fields/${fieldId}/courts/${courtId}/blocked-slots/${slotId}`);
  return response.data.data;
}

// 9. Quản lý bảng giá & Tình trạng sân (Pricing & Availability - PRICE-01..02, AVAIL-01..03)
export async function createOwnerPricing(fieldId: string, payload: CreatePricingPayload): Promise<FieldPricingItem> {
  const response = await apiClient.post<ApiResponse<FieldPricingItem>>(`/owner/fields/${fieldId}/pricing`, payload);
  return response.data.data;
}

export async function getOwnerPricingList(fieldId: string, params?: PricingQueryParams): Promise<FieldPricingItem[]> {
  const response = await apiClient.get<ApiResponse<FieldPricingItem[]>>(`/owner/fields/${fieldId}/pricing`, { params });
  return response.data.data;
}

export async function updateOwnerPricing(fieldId: string, pricingId: string, payload: UpdatePricingPayload): Promise<FieldPricingItem> {
  const response = await apiClient.patch<ApiResponse<FieldPricingItem>>(`/owner/fields/${fieldId}/pricing/${pricingId}`, payload);
  return response.data.data;
}

export async function deleteOwnerPricing(fieldId: string, pricingId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/owner/fields/${fieldId}/pricing/${pricingId}`);
  return response.data.data;
}

export async function getPriceQuote(fieldId: string, params: PriceQuoteQuery): Promise<PriceQuoteResult> {
  const response = await apiClient.get<ApiResponse<PriceQuoteResult>>(`/fields/${fieldId}/pricing/quote`, { params });
  return response.data.data;
}

export async function checkFieldAvailability(fieldId: string, params: CheckAvailabilityQuery): Promise<FieldAvailabilityResult> {
  const response = await apiClient.get<ApiResponse<FieldAvailabilityResult>>(`/fields/${fieldId}/availability`, { params });
  return response.data.data;
}
