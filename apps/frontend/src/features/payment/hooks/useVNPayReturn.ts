import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { verifyVnpayReturn } from '../service/payment.service'
import type { VnpayReturnVerification } from '../interface/payment.interface'

export function useVNPayReturn() {
  const [searchParams] = useSearchParams()
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

    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const deadline = Date.now() + 60_000
    const refresh = async () => {
      try {
        const result = await verifyVnpayReturn(params, controller.signal)
        if (controller.signal.aborted) return
        setVerification(result)
        setError(null)
        if (result.status === 'pending' && Date.now() < deadline) {
          timer = setTimeout(() => void refresh(), 3000)
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Xác thực chữ ký phản hồi từ VNPay thất bại.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    setLoading(true)
    void refresh()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [searchParams])

  return {
    loading,
    hasParams,
    verification,
    error,
    rawParams: Object.fromEntries(searchParams.entries()),
  }
}
