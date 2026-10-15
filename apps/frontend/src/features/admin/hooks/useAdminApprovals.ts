import { useCallback, useEffect, useState } from 'react'
import {
  approveOwnerRegistration,
  getOwnerApprovals,
  rejectOwnerRegistration,
  type AdminOwnerApprovalItem,
} from '../service/admin.service'
import type { ApprovalRequest } from '../admin.data'

export function mapOwnerApprovalToRequest(item: AdminOwnerApprovalItem): ApprovalRequest {
  return {
    id: item.id,
    name: item.ownerProfile?.businessName || item.requester.email,
    applicant: item.requester.email,
    location: item.ownerProfile?.bankAccount || 'Đang cập nhật',
    type: 'owner',
    status: item.status === 'approved' ? 'active' : item.status,
    submittedAt: new Date(item.createdAt).toLocaleDateString('vi-VN'),
    documents: item.ownerProfile?.businessLicense ? 1 : 0,
    risk: 'low',
  }
}

export function useAdminApprovals(type: 'owner' | 'field', query = '') {
  const [apiApprovals, setApiApprovals] = useState<AdminOwnerApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (type !== 'owner') return
    try {
      setLoading(true)
      setError(null)
      const data = await getOwnerApprovals({ search: query || undefined, status: 'pending' })
      setApiApprovals(data.items || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách phê duyệt')
    } finally {
      setLoading(false)
    }
  }, [type, query])

  useEffect(() => {
    loadData()
  }, [loadData])

  const approve = async (id: string, note?: string) => {
    await approveOwnerRegistration(id, note)
    await loadData()
  }

  const reject = async (id: string, reason: string) => {
    await rejectOwnerRegistration(id, reason)
    await loadData()
  }

  return {
    apiApprovals,
    loading,
    error,
    refetch: loadData,
    approve,
    reject,
  }
}
