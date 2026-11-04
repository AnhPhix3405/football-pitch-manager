import { useCallback, useState } from 'react'
import type { AdminFieldApprovalItem } from '../interface/admin.interface'
import { getFieldApprovalDetail } from '../service/admin.service'

export function useAdminFieldApprovalDetail() {
  const [detail, setDetail] = useState<AdminFieldApprovalItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async (id: string): Promise<AdminFieldApprovalItem> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFieldApprovalDetail(id)
      setDetail(data)
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi tải chi tiết phê duyệt sân bóng'
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
