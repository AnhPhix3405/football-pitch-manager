import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verifyVnpayReturn } from '../service/payment.service'
import type { VnpayReturnVerification } from '../interface/payment.interface'

export function useVNPayReturn() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verification, setVerification] = useState<VnpayReturnVerification | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasParams = Boolean(
    searchParams.get('vnp_SecureHash') || searchParams.get('vnp_ResponseCode'),
  )

  useEffect(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((val, key) => {
      params[key] = val
    })

    if (!params.vnp_SecureHash && !params.vnp_ResponseCode) {
      setLoading(false)
      setError(null)
      setVerification(null)
      return
    }

    // Trường hợp giả lập Demo Sandbox từ giao diện test của nhà phát triển
    if (params.vnp_SecureHash === 'simulated_demo_hash') {
      setLoading(false)
      setError(null)
      setVerification({
        isValid: true,
        isSuccess: params.vnp_ResponseCode === '00',
        amount: params.vnp_Amount ? Number(params.vnp_Amount) / 100 : 250000,
        txnRef: params.vnp_TxnRef || 'BK-DEMO-SUCCESS',
        transactionNo: params.vnp_TransactionNo || '14169115',
        bankCode: params.vnp_BankCode || 'NCB',
        message:
          params.vnp_ResponseCode === '00'
            ? 'Giao dịch thành công'
            : 'Giao dịch không thành công',
      })
      return
    }

    setLoading(true)
    verifyVnpayReturn(params)
      .then((res) => {
        setVerification(res)
        setError(null)
      })
      .catch((err: unknown) => {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Xác thực chữ ký phản hồi từ VNPay thất bại.'
        setError(errorMsg)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [searchParams])

  return {
    loading,
    hasParams,
    verification,
    error,
    rawParams: Object.fromEntries(searchParams.entries()),
    setSearchParams,
  }
}
