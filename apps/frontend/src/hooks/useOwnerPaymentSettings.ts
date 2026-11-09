import { useEffect, useState } from 'react'
import type { OwnerPaymentSettings, SaveOwnerPaymentSettings } from '../features/payment/interface/payment.interface'
import { getOwnerPaymentSettings, saveOwnerPaymentSettings } from '../features/payment/service/payment.service'

export function useOwnerPaymentSettings(fieldId: string) {
  const [settings, setSettings] = useState<OwnerPaymentSettings | null>(null)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getOwnerPaymentSettings(fieldId, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setSettings(data) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [fieldId])

  const save = async (values: SaveOwnerPaymentSettings) => {
    setSaving(true)
    try {
      const updated = await saveOwnerPaymentSettings(fieldId, values)
      setSettings(updated)
    } finally {
      setSaving(false)
    }
  }
  return { settings, error, saving, save }
}
