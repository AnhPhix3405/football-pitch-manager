import { useCallback, useEffect, useState } from 'react'
import { deactivateField, getOwnerFields } from '../service/owner.service'
import type { OwnerFieldDetail } from '../interface/owner-field.types'

export function useOwnerFields() {
  const [fields, setFields] = useState<OwnerFieldDetail[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getOwnerFields()
      if (res?.items) {
        setFields(res.items as OwnerFieldDetail[])
      } else {
        setFields([])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách sân')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const deleteField = async (fieldId: string) => {
    try {
      await deactivateField(fieldId)
    } finally {
      setRemoved((items) => [...items, fieldId])
    }
  }

  return {
    fields,
    apiFields: fields,
    removed,
    loading,
    error,
    refetch: loadData,
    deleteField,
  }
}
