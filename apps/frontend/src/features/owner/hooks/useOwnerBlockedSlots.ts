import { useCallback, useEffect, useState } from 'react'
import {
  createOwnerBlockedSlot,
  deleteOwnerBlockedSlot,
  getOwnerBlockedSlots,
} from '../service/owner.service'
import type {
  BlockedSlotItem,
  BlockedSlotQueryParams,
  CreateBlockedSlotPayload,
} from '../interface/owner-field.types'

export function useOwnerBlockedSlots(fieldId?: string, courtId?: string) {
  const [slots, setSlots] = useState<BlockedSlotItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSlots = useCallback(
    async (params?: BlockedSlotQueryParams) => {
      if (!fieldId || !courtId) return []
      try {
        setLoading(true)
        setError(null)
        const list = await getOwnerBlockedSlots(fieldId, courtId, params)
        setSlots(list)
        return list
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách khóa lịch'
        setError(msg)
        return []
      } finally {
        setLoading(false)
      }
    },
    [fieldId, courtId],
  )

  useEffect(() => {
    if (fieldId && courtId) {
      void loadSlots()
    }
  }, [fieldId, courtId, loadSlots])

  const createBlockedSlot = async (payload: CreateBlockedSlotPayload) => {
    if (!fieldId || !courtId) throw new Error('Field ID and Court ID are required')
    const created = await createOwnerBlockedSlot(fieldId, courtId, payload)
    setSlots((prev) => [...prev, created])
    return created
  }

  const deleteBlockedSlot = async (slotId: string) => {
    if (!fieldId || !courtId) throw new Error('Field ID and Court ID are required')
    const deleted = await deleteOwnerBlockedSlot(fieldId, courtId, slotId)
    setSlots((prev) => prev.filter((item) => item.id !== slotId))
    return deleted
  }

  return {
    slots,
    loading,
    error,
    loadSlots,
    createBlockedSlot,
    deleteBlockedSlot,
  }
}
