import { useCallback, useEffect, useState } from 'react'
import type { ApprovalRequest } from '../admin.data'
import type {
  AdminFieldApprovalItem,
  AdminOwnerApprovalItem,
} from '../interface/admin.interface'
import {
  approveFieldRequest,
  approveOwnerRegistration,
  getFieldApprovals,
  getOwnerApprovals,
  rejectFieldRequest,
  rejectOwnerRegistration,
} from '../service/admin.service'

export function mapOwnerApprovalToRequest(item: AdminOwnerApprovalItem): ApprovalRequest {
  return {
    id: item.id,
    name: item.ownerProfile?.businessName || item.requester.email,
    applicant: item.requester.email,
    phone: item.requester.phone,
    license: item.ownerProfile?.businessLicense || null,
    bankAccount: item.ownerProfile?.bankAccount || null,
    location: item.ownerProfile?.bankAccount || 'Đang cập nhật',
    type: 'owner',
    status: item.status,
    submittedAt: new Date(item.createdAt).toLocaleString('vi-VN'),
  }
}

export function mapFieldApprovalToRequest(item: AdminFieldApprovalItem): ApprovalRequest {
  const locationParts = [item.targetField?.address, item.targetField?.district, item.targetField?.city].filter(Boolean)
  return {
    id: item.id,
    name: item.targetField?.name || (item.proposedChanges?.name as string) || 'Cụm sân bóng',
    applicant: item.requester?.email || 'N/A',
    phone: item.requester?.phone || null,
    location: locationParts.length > 0 ? locationParts.join(', ') : 'Đang cập nhật vị trí',
    type: 'field',
    status: item.status,
    submittedAt: new Date(item.createdAt).toLocaleString('vi-VN'),
  }
}

export function useAdminApprovals(type: 'owner' | 'field', query = '') {
  const [apiApprovals, setApiApprovals] = useState<(AdminOwnerApprovalItem | AdminFieldApprovalItem)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (type === 'owner') {
        const data = await getOwnerApprovals({ search: query || undefined, status: 'pending' })
        setApiApprovals(data.items || [])
      } else {
        const data = await getFieldApprovals({ status: 'pending' })
        setApiApprovals(data.items || [])
      }
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
    if (type === 'owner') {
      await approveOwnerRegistration(id, note)
    } else {
      await approveFieldRequest(id, note)
    }
    await loadData()
  }

  const reject = async (id: string, reason: string) => {
    if (type === 'owner') {
      await rejectOwnerRegistration(id, reason)
    } else {
      await rejectFieldRequest(id, reason)
    }
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
