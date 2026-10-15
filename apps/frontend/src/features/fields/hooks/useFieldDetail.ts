import { useCallback, useEffect, useState } from 'react'
import { getFieldById } from '../field.data'
import { getPublicFieldDetail } from '../service/field.service'
import type { FootballField } from '../interface/field.types'

export function useFieldDetail(fieldId: string) {
  const [field, setField] = useState<FootballField | null>(() => getFieldById(fieldId) || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!fieldId) return
    try {
      setLoading(true)
      setError(null)
      const item = await getPublicFieldDetail(fieldId)
      setField({
        id: item.id,
        name: item.name,
        district: item.district || 'Hồ Chí Minh',
        city: 'Hồ Chí Minh',
        address: item.address,
        format: '7v7',
        surface: 'Cỏ nhân tạo',
        pricePerHour: item.depositValue || 350000,
        rating: 5.0,
        reviewCount: 0,
        distanceKm: 2.1,
        imageUrl:
          'https://images.unsplash.com/photo-1529900240041-22f1ae4d6821?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1529900240041-22f1ae4d6821?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: ['Đèn chiếu sáng', 'Bãi giữ xe', 'Nước uống', 'Phòng thay đồ'],
        description: item.description || 'Cụm sân bóng đá cỏ nhân tạo tiêu chuẩn.',
        coordinates: {
          x: item.lng ? (Math.abs(item.lng) % 80) + 10 : 45,
          y: item.lat ? (Math.abs(item.lat) % 80) + 10 : 45,
        },
        featured: false,
        availableToday: true,
      })
    } catch {
      const fallback = getFieldById(fieldId)
      if (fallback) {
        setField(fallback)
      } else {
        setError('Không tìm thấy sân bóng')
      }
    } finally {
      setLoading(false)
    }
  }, [fieldId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { field, loading, error, refetch: fetchDetail }
}
