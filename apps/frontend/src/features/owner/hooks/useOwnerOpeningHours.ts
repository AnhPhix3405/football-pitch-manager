import { useCallback, useEffect, useState } from 'react'
import {
  getOwnerOpeningHours,
  upsertOwnerOpeningHours,
} from '../service/owner.service'
import type {
  FieldOpeningHourItem,
  UpsertOpeningHoursPayload,
} from '../interface/owner-field.types'

export function useOwnerOpeningHours(fieldId?: string) {
  const [hours, setHours] = useState<FieldOpeningHourItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHours = useCallback(async () => {
    if (!fieldId) return []
    try {
      setLoading(true)
      setError(null)
      const list = await getOwnerOpeningHours(fieldId)
      // Sort dayOfWeek 1 to 7
      const sorted = [...list].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      setHours(sorted)
      return sorted
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải lịch mở cửa'
      setError(msg)
      return []
    } finally {
      setLoading(false)
    }
  }, [fieldId])

  useEffect(() => {
    if (fieldId) {
      void loadHours()
    }
  }, [fieldId, loadHours])

  const saveOpeningHours = async (payload: UpsertOpeningHoursPayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const updated = await upsertOwnerOpeningHours(fieldId, payload)
    const sorted = [...updated].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    setHours(sorted)
    return sorted
  }

  return {
    hours,
    loading,
    error,
    loadHours,
    saveOpeningHours,
  }
}
