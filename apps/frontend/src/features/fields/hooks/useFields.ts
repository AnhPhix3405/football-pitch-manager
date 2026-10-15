import { useCallback, useEffect, useState } from 'react'
import { getPublicFields } from '../service/field.service'
import type { BackendFieldItem } from '../service/field.service'
import type { FieldFilters, FootballField } from '../interface/field.types'

export function mapBackendFieldToFootballField(item: BackendFieldItem): FootballField {
  return {
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
      'https://images.unsplash.com/photo-1529900240041-22f1ae4d6821?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529900240041-22f1ae4d6821?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['Đèn chiếu sáng', 'Bãi giữ xe', 'Nước uống'],
    description: item.description || '',
    coordinates: {
      x: item.lng ? (Math.abs(item.lng) % 80) + 10 : 45,
      y: item.lat ? (Math.abs(item.lat) % 80) + 10 : 45,
    },
    featured: false,
    availableToday: true,
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
        `${field.name} ${field.district} ${field.city}`
          .toLowerCase()
          .includes(filters.query.toLowerCase())
      const matchDistrict = filters.district === 'all' || field.district === filters.district
      const matchFormat = filters.format === 'all' || field.format === filters.format
      const matchPrice = field.pricePerHour <= filters.maxPrice
      const matchAvailable = !filters.availableOnly || field.availableToday
      return matchQuery && matchDistrict && matchFormat && matchPrice && matchAvailable
    })
    .sort((a, b) => {
      if (filters.sort === 'rating') return b.rating - a.rating
      if (filters.sort === 'price-asc') return a.pricePerHour - b.pricePerHour
      return Number(b.featured) - Number(a.featured)
    })
}

export function useFields(query?: string, district?: string, page = 1) {
  const [apiFields, setApiFields] = useState<FootballField[]>([])
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
        limit: 10,
      })
      if (res?.items) {
        setApiFields(res.items.map(mapBackendFieldToFootballField))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách sân')
    } finally {
      setLoading(false)
    }
  }, [query, district, page])

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  return { apiFields, loading, error, refetch: fetchFields }
}
