import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type { PaymentMethod } from '../constants/payment.constant'
import type {
  ConfirmCashPaymentPayload,
  CreateVnpayUrlPayload,
  PaymentTransaction,
  RefundPaymentPayload,
  VnpayReturnVerification,
  VnpayUrlResponse,
} from '../interface/payment.interface'

export async function selectPaymentMethod(
  bookingId: string,
  method: PaymentMethod,
): Promise<PaymentTransaction> {
  const response = await apiClient.post<ApiResponse<PaymentTransaction>>(
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
): Promise<VnpayReturnVerification> {
  const response = await apiClient.get<ApiResponse<VnpayReturnVerification>>(
    '/payments/vnpay/return',
    { params },
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

