import { useCallback, useState } from 'react'
import type { AdminOwnerApprovalItem } from '../interface/admin.interface'
import { getOwnerApprovalDetail } from '../service/admin.service'

export function useAdminOwnerApprovalDetail() {
  const [detail, setDetail] = useState<AdminOwnerApprovalItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async (id: string): Promise<AdminOwnerApprovalItem> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOwnerApprovalDetail(id)
      setDetail(data)
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi tải chi tiết phê duyệt chủ sân'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetDetail = useCallback(() => {
    setDetail(null)
    setError(null)
  }, [])

  return {
    detail,
    loading,
    error,
    fetchDetail,
    resetDetail,
  }
}
