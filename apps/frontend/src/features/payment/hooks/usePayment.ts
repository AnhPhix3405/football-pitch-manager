import { useState, useCallback } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import { PAYMENT_METHOD, type PaymentMethod } from '../constants/payment.constant'
import {
  createVnpayUrl,
  selectPaymentMethod,
  confirmCashPayment,
  refundPayment,
} from '../service/payment.service'
import type {
  ConfirmCashPaymentPayload,
  CashPaymentSelection,
  BookingPaymentOption,
  PaymentTransaction,
  RefundPaymentPayload,
} from '../interface/payment.interface'

export function usePayment() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processPayment = useCallback(
    async (
      bookingId: string,
      method: PaymentMethod,
      orderInfo?: string,
      option?: Exclude<BookingPaymentOption, 'cash'>,
    ): Promise<PaymentTransaction | CashPaymentSelection | { redirectUrl: string } | null> => {
      setLoading(true)
      setError(null)
      try {
        if (method === PAYMENT_METHOD.VNPAY) {
          const vnpayRes = await createVnpayUrl({ bookingId, orderInfo, option })
          if (vnpayRes?.paymentUrl) {
            window.location.href = vnpayRes.paymentUrl
            return { redirectUrl: vnpayRes.paymentUrl }
          }
          throw new Error(t('payment.errors.urlFailed', { defaultValue: 'Không thể tạo liên kết VNPay.' }))
        } else {
          const tx = await selectPaymentMethod(bookingId, PAYMENT_METHOD.CASH)
          message.success(t('payment.cashSuccess', { defaultValue: 'Đã chọn phương thức thanh toán tiền mặt tại sân.' }))
          return tx
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : t('payment.errors.general', { defaultValue: 'Xử lý thanh toán thất bại.' })
        setError(errorMsg)
        message.error(errorMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [t],
  )

  const handleConfirmCash = useCallback(
    async (bookingId: string, payload?: ConfirmCashPaymentPayload): Promise<PaymentTransaction | null> => {
      setLoading(true)
      setError(null)
      try {
        const tx = await confirmCashPayment(bookingId, payload)
        message.success(t('payment.ownerCashConfirmed', { defaultValue: 'Xác nhận thu tiền mặt thành công.' }))
        return tx
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : t('payment.errors.confirmFailed', { defaultValue: 'Xác nhận tiền mặt thất bại.' })
        setError(errorMsg)
        message.error(errorMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [t],
  )

  const handleRefund = useCallback(
    async (bookingId: string, payload: RefundPaymentPayload): Promise<PaymentTransaction | null> => {
      setLoading(true)
      setError(null)
      try {
        const tx = await refundPayment(bookingId, payload)
        message.success(t('payment.refundSuccess', { defaultValue: 'Yêu cầu hoàn tiền đã được xử lý thành công.' }))
        return tx
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : t('payment.errors.refundFailed', { defaultValue: 'Hoàn tiền thất bại.' })
        setError(errorMsg)
        message.error(errorMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [t],
  )

  return {
    loading,
    error,
    processPayment,
    handleConfirmCash,
    handleRefund,
  }
}
