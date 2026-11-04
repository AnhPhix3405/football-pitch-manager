import { useCallback, useEffect, useState } from 'react'
import {
  createOwnerService,
  deleteOwnerService,
  getOwnerServices,
  updateOwnerService,
} from '../service/owner.service'
import type {
  CreateServicePayload,
  OwnerServiceItem,
  ServiceQueryParams,
  UpdateServicePayload,
} from '../interface/owner-field.types'

export function useOwnerServices(fieldId?: string) {
  const [services, setServices] = useState<OwnerServiceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadServices = useCallback(
    async (params?: ServiceQueryParams) => {
      if (!fieldId) return []
      try {
        setLoading(true)
        setError(null)
        const list = await getOwnerServices(fieldId, params)
        setServices(list)
        return list
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách dịch vụ'
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
      void loadServices()
    }
  }, [fieldId, loadServices])

  const createService = async (payload: CreateServicePayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const created = await createOwnerService(fieldId, payload)
    setServices((prev) => [...prev, created])
    return created
  }

  const updateService = async (serviceId: string, payload: UpdateServicePayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const updated = await updateOwnerService(fieldId, serviceId, payload)
    setServices((prev) => prev.map((item) => (item.id === serviceId ? updated : item)))
    return updated
  }

  const deleteService = async (serviceId: string) => {
    if (!fieldId) throw new Error('Field ID is required')
    const deactivated = await deleteOwnerService(fieldId, serviceId)
    setServices((prev) => prev.map((item) => (item.id === serviceId ? deactivated : item)))
    return deactivated
  }

  return {
    services,
    loading,
    error,
    loadServices,
    createService,
    updateService,
    deleteService,
  }
}
