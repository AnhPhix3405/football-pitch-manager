import { apiClient, type ApiResponse } from '~/config/axios.config'
import type {
  AvailableSlotsResponse,
  AvailabilityQueryParams,
  BackendBooking,
  BackendBookingListResponse,
  CreateBookingPayload,
  FieldAvailabilityResponse,
  PriceQuoteQueryParams,
  PriceQuoteResponse,
  UserBookingQueryParams,
  CancellationPreviewData,
} from '../interface/booking.types'

/**
 * Lấy danh sách lịch đặt sân của người dùng hiện tại
 */
export async function getMyBookingsApi(
  params?: UserBookingQueryParams,
): Promise<BackendBookingListResponse> {
  const response = await apiClient.get<ApiResponse<BackendBookingListResponse>>(
    '/bookings/me',
    { params },
  )
  return response.data?.data
}

/**
 * Lấy chi tiết một lịch đặt sân
 */
export async function getBookingDetailApi(id: string): Promise<BackendBooking> {
  const response = await apiClient.get<ApiResponse<BackendBooking>>(
    `/bookings/${id}`,
  )
  return response.data?.data
}

/**
 * Xem trước chính sách hủy, tỷ lệ phạt và số tiền hoàn cọc
 */
export async function getCancellationPreviewApi(
  id: string,
): Promise<CancellationPreviewData> {
  const response = await apiClient.get<ApiResponse<CancellationPreviewData>>(
    `/bookings/${id}/cancellation-preview`,
  )
  return response.data?.data
}

/**
 * Hủy một lịch đặt sân
 */
export async function cancelBookingApi(
  id: string,
  reason: string,
): Promise<BackendBooking> {
  const response = await apiClient.post<ApiResponse<BackendBooking>>(
    `/bookings/${id}/cancel`,
    { reason },
  )
  return response.data?.data
}

/**
 * Tạo đơn đặt sân mới
 */
export async function createBookingApi(
  payload: CreateBookingPayload,
): Promise<BackendBooking> {
  const response = await apiClient.post<ApiResponse<BackendBooking>>(
    '/bookings',
    payload,
  )
  return response.data?.data
}

/**
 * Kiểm tra khung giờ và tình trạng khả dụng của sân theo ngày
 */
export async function getFieldAvailabilityApi(
  fieldId: string,
  params: AvailabilityQueryParams,
): Promise<FieldAvailabilityResponse> {
  const response = await apiClient.get<ApiResponse<FieldAvailabilityResponse>>(
    `/fields/${fieldId}/availability`,
    { params },
  )
  return response.data?.data
}

export async function getFieldAvailableSlotsApi(
  fieldId: string,
  params: { date: string; courtType: string },
  signal?: AbortSignal,
): Promise<AvailableSlotsResponse> {
  const response = await apiClient.get<ApiResponse<AvailableSlotsResponse>>(
    `/fields/${fieldId}/availability/slots`,
    { params, signal },
  )
  return response.data.data
}

/**
 * Lấy báo giá chính xác cho khung giờ và loại sân
 */
export async function getFieldPriceQuoteApi(
  fieldId: string,
  params: PriceQuoteQueryParams,
): Promise<PriceQuoteResponse> {
  const response = await apiClient.get<ApiResponse<PriceQuoteResponse>>(
    `/fields/${fieldId}/pricing/quote`,
    { params },
  )
  return response.data?.data
}

