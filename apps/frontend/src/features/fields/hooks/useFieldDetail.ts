import { useCallback, useEffect, useState } from 'react'
import { mapBackendFieldToFootballField } from './useFields'
import type { FootballField } from '../interface/field.types'
import { getPublicFieldDetail } from '../service/field.service'

export function useFieldDetail(fieldId: string) {
  const [field, setField] = useState<FootballField | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!fieldId) return
    try {
      setLoading(true)
      setError(null)
      const item = await getPublicFieldDetail(fieldId)

      setField(mapBackendFieldToFootballField(item))
    } catch {
      setField(null)
      setError('Không tìm thấy sân bóng')
    } finally {
      setLoading(false)
    }
  }, [fieldId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { field, loading, error, refetch: fetchDetail }
}
