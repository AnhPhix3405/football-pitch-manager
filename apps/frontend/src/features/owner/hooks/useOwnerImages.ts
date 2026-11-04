import { useCallback, useEffect, useState } from 'react'
import {
  addOwnerImage,
  deleteOwnerImage,
  getOwnerImages,
  updateOwnerImage,
} from '../service/owner.service'
import type {
  CreateImagePayload,
  OwnerImageItem,
  UpdateImagePayload,
} from '../interface/owner-field.types'

export function useOwnerImages(fieldId?: string) {
  const [images, setImages] = useState<OwnerImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadImages = useCallback(async () => {
    if (!fieldId) return []
    try {
      setLoading(true)
      setError(null)
      const list = await getOwnerImages(fieldId)
      setImages(list)
      return list
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải danh sách hình ảnh'
      setError(msg)
      return []
    } finally {
      setLoading(false)
    }
  }, [fieldId])

  useEffect(() => {
    if (fieldId) {
      void loadImages()
    }
  }, [fieldId, loadImages])

  const addImage = async (payload: CreateImagePayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const added = await addOwnerImage(fieldId, payload)
    // If marked as thumbnail, unmark other thumbnails locally
    setImages((prev) => {
      let next = [...prev]
      if (added.isThumbnail) {
        next = next.map((img) => ({ ...img, isThumbnail: false }))
      }
      return [...next, added].sort((a, b) => a.displayOrder - b.displayOrder)
    })
    return added
  }

  const updateImage = async (imageId: string, payload: UpdateImagePayload) => {
    if (!fieldId) throw new Error('Field ID is required')
    const updated = await updateOwnerImage(fieldId, imageId, payload)
    setImages((prev) => {
      let next = prev.map((img) => (img.id === imageId ? updated : img))
      if (updated.isThumbnail) {
        next = next.map((img) => (img.id === imageId ? updated : { ...img, isThumbnail: false }))
      }
      return next.sort((a, b) => a.displayOrder - b.displayOrder)
    })
    return updated
  }

  const deleteImage = async (imageId: string) => {
    if (!fieldId) throw new Error('Field ID is required')
    const deleted = await deleteOwnerImage(fieldId, imageId)
    setImages((prev) => prev.filter((img) => img.id !== imageId))
    return deleted
  }

  return {
    images,
    loading,
    error,
    loadImages,
    addImage,
    updateImage,
    deleteImage,
  }
}
