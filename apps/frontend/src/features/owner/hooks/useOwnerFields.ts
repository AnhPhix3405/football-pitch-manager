import { useCallback, useEffect, useState } from 'react'
import { deactivateField, getOwnerFields } from '../service/owner.service'
import type { OwnerField } from '../owner.data'

export function useOwnerFields() {
  const [apiFields, setApiFields] = useState<OwnerField[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getOwnerFields()
      if (res?.items && res.items.length > 0) {
        const mapped: OwnerField[] = res.items.map((item) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          format: '7v7',
          price: item.depositValue || 350000,
          status:
            item.status === 'pending' || item.status === 'maintenance'
              ? item.status
              : 'active',
          bookingsToday: 0,
          image:
            'https://images.unsplash.com/photo-1529900240041-22f1ae4d6821?auto=format&fit=crop&w=1200&q=80',
        }))
        setApiFields(mapped)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách sân')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const deleteField = async (fieldId: string) => {
    try {
      await deactivateField(fieldId)
    } finally {
      setRemoved((items) => [...items, fieldId])
    }
  }

  return { apiFields, removed, loading, error, refetch: loadData, deleteField }
}
