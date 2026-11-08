import { useCallback, useEffect, useState } from 'react'
import { footballFields } from '../field.data'
import type { FieldFilters, FootballField } from '../interface/field.types'
import type { BackendFieldItem } from '../service/field.service'
import { getPublicFields } from '../service/field.service'

export function mapBackendFieldToFootballField(item: BackendFieldItem): FootballField {
  const isHanoi =
    item.address?.toLowerCase().includes('hà nội') ||
    item.district?.toLowerCase().includes('hoàn kiếm') ||
    item.district?.toLowerCase().includes('cầu giấy') ||
    item.district?.toLowerCase().includes('đống đa')

  const defaultLat = isHanoi ? 21.0285 : 10.7981
  const defaultLng = isHanoi ? 105.8542 : 106.6543

  return {
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
    imageUrl:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Đèn chiếu sáng LED', 'Bãi giữ xe rộng', 'Nước uống', 'Phòng thay đồ'],
    description: item.description || 'Cụm sân bóng đá cỏ nhân tạo tiêu chuẩn thi đấu phong trào.',
    coordinates: {
      x: item.lng ? (Math.abs(item.lng) % 70) + 15 : 45,
      y: item.lat ? (Math.abs(item.lat) % 70) + 15 : 45,
    },
    lat: item.lat ?? defaultLat,
    lng: item.lng ?? defaultLng,
    featured: true,
    availableToday: true,
    hasOwnerAccount: true,
    phone: '0988 123 456',
  }
}

export function filterAndSortFields(
  fields: FootballField[],
  filters: FieldFilters,
): FootballField[] {
  return fields
    .filter((field) => {
      const matchQuery =
        !filters.query ||
        `${field.name} ${field.district} ${field.city} ${field.address}`
          .toLowerCase()
          .includes(filters.query.toLowerCase())

      const matchCity =
        !filters.city || filters.city === 'all' || field.city.toLowerCase().includes(filters.city.toLowerCase())

      const matchDistrict =
        filters.district === 'all' ||
        field.district.toLowerCase() === filters.district.toLowerCase()

      const matchFormat = filters.format === 'all' || field.format === filters.format
      const matchPrice = field.pricePerHour <= filters.maxPrice
      const matchAvailable = !filters.availableOnly || field.availableToday

      return matchQuery && matchCity && matchDistrict && matchFormat && matchPrice && matchAvailable
    })
    .sort((a, b) => {
      if (filters.sort === 'rating') return b.rating - a.rating
      if (filters.sort === 'price-asc') return a.pricePerHour - b.pricePerHour
      return Number(b.featured) - Number(a.featured)
    })
}

export function useFields(query?: string, district?: string, page = 1) {
  const [apiFields, setApiFields] = useState<FootballField[]>([])
  const [combinedFields, setCombinedFields] = useState<FootballField[]>(footballFields)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getPublicFields({
        search: query || undefined,
        district: district !== 'all' ? district : undefined,
        page,
        limit: 20,
      })

      if (res?.items && res.items.length > 0) {
        const mapped = res.items.map(mapBackendFieldToFootballField)
        setApiFields(mapped)

        // Ghép sân API lên đầu, loại bỏ trùng tên và thêm sân mẫu Hà Nội & TP.HCM
        const apiNames = new Set(mapped.map((f) => f.name.toLowerCase()))
        const nonDuplicateMocks = footballFields.filter(
          (mock) => !apiNames.has(mock.name.toLowerCase()),
        )
        setCombinedFields([...mapped, ...nonDuplicateMocks])
      } else {
        setApiFields([])
        setCombinedFields(footballFields)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách sân')
      setCombinedFields(footballFields)
    } finally {
      setLoading(false)
    }
  }, [query, district, page])

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  return { apiFields, combinedFields, loading, error, refetch: fetchFields }
}
