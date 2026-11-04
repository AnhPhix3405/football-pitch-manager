import { useCallback, useEffect, useState } from 'react'
import { ADMIN_APPROVALS_PAGE_SIZE } from '../constants/pagination.constant'
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
import type { ApprovalStatusFilter } from '../constants/status-filter.constant'

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
    requestType: item.type,
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
    requestType: item.type,
    status: item.status,
    submittedAt: new Date(item.createdAt).toLocaleString('vi-VN'),
  }
}

export function useAdminApprovals(
  type: 'owner' | 'field',
  query = '',
  status: ApprovalStatusFilter = 'pending',
  fromDate?: string,
  toDate?: string,
) {
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [apiApprovals, setApiApprovals] = useState<(AdminOwnerApprovalItem | AdminFieldApprovalItem)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [type, query, status, fromDate, toDate])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (type === 'owner') {
        const data = await getOwnerApprovals({
          search: query || undefined,
          status: status === 'all' ? undefined : status,
          fromDate,
          toDate,
          page,
          limit: ADMIN_APPROVALS_PAGE_SIZE,
        })
        setApiApprovals(data.items || [])
        setTotal(data.total || 0)
      } else {
        const data = await getFieldApprovals({
          search: query || undefined,
          status: status === 'all' ? undefined : status,
          fromDate,
          toDate,
          page,
          limit: ADMIN_APPROVALS_PAGE_SIZE,
        })
        setApiApprovals(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách phê duyệt')
    } finally {
      setLoading(false)
    }
  }, [type, query, status, fromDate, toDate, page])

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
    page,
    setPage,
    total,
    refetch: loadData,
    approve,
    reject,
  }
}
