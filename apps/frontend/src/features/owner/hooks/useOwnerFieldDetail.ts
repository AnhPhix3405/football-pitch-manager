import { useCallback, useState } from 'react'
import { getOwnerFieldDetail } from '../service/owner.service'
import type { OwnerFieldDetail } from '../interface/owner-field.types'

export function useOwnerFieldDetail() {
  const [detail, setDetail] = useState<OwnerFieldDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFieldDetail = useCallback(async (fieldId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOwnerFieldDetail(fieldId)
      setDetail(data)
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông tin chi tiết cụm sân'
      setError(message)
      setDetail(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetDetail = useCallback(() => {
    setDetail(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    detail,
    loading,
    error,
    fetchFieldDetail,
    resetDetail,
  }
}
