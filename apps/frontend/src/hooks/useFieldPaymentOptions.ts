import { useEffect, useState } from 'react'
import type { FieldPaymentOptions } from '../features/payment/interface/payment.interface'
import { getFieldPaymentOptions } from '../features/payment/service/payment.service'

export function useFieldPaymentOptions(fieldId: string) {
  const [settings, setSettings] = useState<FieldPaymentOptions | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setSettings(null)
    setError(false)
    getFieldPaymentOptions(fieldId, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setSettings(data) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [fieldId])

  return { settings, error }
}
