import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_FIELD_FALLBACK_IMAGE, getFieldById } from '../field.data'
import type { FootballField } from '../interface/field.types'
import { getPublicFieldDetail } from '../service/field.service'

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

      const isHanoi =
        item.address?.toLowerCase().includes('hà nội') ||
        item.district?.toLowerCase().includes('hoàn kiếm') ||
        item.district?.toLowerCase().includes('cầu giấy')

      const lat = item.lat ?? (isHanoi ? 21.0285 : 10.7981)
      const lng = item.lng ?? (isHanoi ? 105.8542 : 106.6543)

      setField({
        id: item.id,
        name: item.name,
        district: item.district || (isHanoi ? 'Cầu Giấy' : 'Tân Bình'),
        city: isHanoi ? 'Hà Nội' : 'TP. Hồ Chí Minh',
        address: item.address,
        format: '7v7',
        surface: 'Cỏ nhân tạo',
        pricePerHour: item.depositValue ? Math.round(item.depositValue / 0.3) : 400000,
        rating: 5.0,
        reviewCount: 12,
        distanceKm: 2.1,
        imageUrl: DEFAULT_FIELD_FALLBACK_IMAGE,
        gallery: [
          DEFAULT_FIELD_FALLBACK_IMAGE,
          'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80',
        ],
        amenities: ['Đèn chiếu sáng LED', 'Bãi giữ xe', 'Nước uống', 'Phòng thay đồ'],
        description: item.description || 'Cụm sân bóng đá cỏ nhân tạo tiêu chuẩn thi đấu phong trào.',
        coordinates: {
          x: item.lng ? (Math.abs(item.lng) % 70) + 15 : 45,
          y: item.lat ? (Math.abs(item.lat) % 70) + 15 : 45,
        },
        lat,
        lng,
        featured: false,
        availableToday: true,
        hasOwnerAccount: true,
        phone: '0988 123 456',
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
