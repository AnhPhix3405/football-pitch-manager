import { useCallback, useEffect, useState } from 'react'
import {
  createOwnerCourt,
  deleteOwnerCourt,
  getOwnerCourtDetail,
  getOwnerCourtsList,
  updateOwnerCourt,
} from '../service/owner.service'
import type {
  CourtQueryParams,
  CreateCourtPayload,
  OwnerCourtItem,
  UpdateCourtPayload,
} from '../interface/owner-field.types'

export function useOwnerCourts(fieldId?: string) {
  const [courts, setCourts] = useState<OwnerCourtItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourt, setSelectedCourt] = useState<OwnerCourtItem | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadCourts = useCallback(
    async (params?: CourtQueryParams) => {
      if (!fieldId) return []
      try {
        setLoading(true)
        setError(null)
        const items = await getOwnerCourtsList(fieldId, params)
        setCourts(items)
        return items
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách sân con'
        setError(msg)
        return []
      } finally {
        setLoading(false)
      }
    },
    [fieldId],
  )

  useEffect(() => {
    if (fieldId) {
      void loadCourts()
    }
  }, [fieldId, loadCourts])

  const fetchCourtDetail = async (courtId: string) => {
    if (!fieldId) return null
    try {
      setLoadingDetail(true)
      const court = await getOwnerCourtDetail(fieldId, courtId)
      setSelectedCourt(court)
      return court
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải chi tiết sân con'
      setError(msg)
      return null
    } finally {
      setLoadingDetail(false)
    }
  }

  const createCourt = async (payload: CreateCourtPayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const newCourt = await createOwnerCourt(fieldId, payload)
    setCourts((prev) => [...prev, newCourt])
    return newCourt
  }

  const updateCourt = async (courtId: string, payload: UpdateCourtPayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const updated = await updateOwnerCourt(fieldId, courtId, payload)
    setCourts((prev) => prev.map((item) => (item.id === courtId ? updated : item)))
    if (selectedCourt?.id === courtId) {
      setSelectedCourt(updated)
    }
    return updated
  }

  const deleteCourt = async (courtId: string) => {
    if (!fieldId) throw new Error('Field ID is required')
    const deactivated = await deleteOwnerCourt(fieldId, courtId)
    setCourts((prev) => prev.map((item) => (item.id === courtId ? deactivated : item)))
    return deactivated
  }

  return {
    courts,
    loading,
    error,
    selectedCourt,
    loadingDetail,
    loadCourts,
    fetchCourtDetail,
    setSelectedCourt,
    createCourt,
    updateCourt,
    deleteCourt,
  }
}
