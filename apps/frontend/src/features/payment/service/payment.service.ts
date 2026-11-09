import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type { PaymentMethod } from '../constants/payment.constant'
import type {
  ConfirmCashPaymentPayload,
  CashPaymentSelection,
  FieldPaymentOptions,
  OwnerPaymentSettings,
  SaveOwnerPaymentSettings,
  CreateVnpayUrlPayload,
  PaymentTransaction,
  RefundPaymentPayload,
  VnpayReturnVerification,
  VnpayUrlResponse,
} from '../interface/payment.interface'

export async function selectPaymentMethod(
  bookingId: string,
  method: PaymentMethod,
): Promise<PaymentTransaction | CashPaymentSelection> {
  const response = await apiClient.post<ApiResponse<PaymentTransaction | CashPaymentSelection>>(
    `/bookings/${bookingId}/payment-method`,
    { method },
  )
  return response.data.data
}

export async function createVnpayUrl(
  payload: CreateVnpayUrlPayload,
): Promise<VnpayUrlResponse> {
  const response = await apiClient.post<ApiResponse<VnpayUrlResponse>>(
    '/payments/vnpay/create-url',
    payload,
  )
  return response.data.data
}

export async function verifyVnpayReturn(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<VnpayReturnVerification> {
  const response = await apiClient.get<ApiResponse<VnpayReturnVerification>>(
    '/payments/vnpay/return',
    { params, signal },
  )
  return response.data.data
}

export async function confirmCashPayment(
  bookingId: string,
  payload?: ConfirmCashPaymentPayload,
): Promise<PaymentTransaction> {
  const response = await apiClient.post<ApiResponse<PaymentTransaction>>(
    `/owner/bookings/${bookingId}/confirm-cash`,
    payload || {},
  )
  return response.data.data
}

export async function refundPayment(
  bookingId: string,
  payload: RefundPaymentPayload,
): Promise<PaymentTransaction> {
  const response = await apiClient.post<ApiResponse<PaymentTransaction>>(
    `/payments/bookings/${bookingId}/refund`,
    payload,
  )
  return response.data.data
}


export async function getFieldPaymentOptions(fieldId: string, signal?: AbortSignal) {
  const response = await apiClient.get<ApiResponse<FieldPaymentOptions>>(`/payments/fields/${fieldId}/options`, { signal })
  return response.data.data
}

export async function getOwnerPaymentSettings(fieldId: string, signal?: AbortSignal) {
  const response = await apiClient.get<ApiResponse<OwnerPaymentSettings>>(`/owner/fields/${fieldId}/payment-settings`, { signal })
  return response.data.data
}

export async function saveOwnerPaymentSettings(fieldId: string, settings: SaveOwnerPaymentSettings) {
  const { depositType, depositValue, ...rest } = settings
  const response = await apiClient.put<ApiResponse<OwnerPaymentSettings>>(`/owner/fields/${fieldId}/payment-settings`, {
    ...rest, depositType: depositType ?? undefined, depositValue: depositValue ?? undefined,
  })
  return response.data.data
}
