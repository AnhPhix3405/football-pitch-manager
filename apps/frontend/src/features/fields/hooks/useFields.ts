import { useCallback, useEffect, useState } from 'react'
import type { FieldFilters, FootballField } from '../interface/field.types'
import type { BackendFieldItem } from '../service/field.service'
import { getPublicFields } from '../service/field.service'

export function mapBackendFieldToFootballField(item: BackendFieldItem): FootballField {
  const addressAndDistrict = `${item.address || ''} ${item.district || ''}`.toLowerCase()
  const isHanoi =
    addressAndDistrict.includes('hà nội') ||
    addressAndDistrict.includes('hoàn kiếm') ||
    addressAndDistrict.includes('cầu giấy') ||
    addressAndDistrict.includes('đống đa') ||
    addressAndDistrict.includes('ba đình') ||
    addressAndDistrict.includes('hai bà trưng') ||
    addressAndDistrict.includes('thanh xuân') ||
    addressAndDistrict.includes('tây hồ') ||
    addressAndDistrict.includes('nam từ liêm') ||
    addressAndDistrict.includes('bắc từ liêm') ||
    addressAndDistrict.includes('hoàng mai') ||
    addressAndDistrict.includes('long biên') ||
    addressAndDistrict.includes('hà đông') ||
    (typeof item.lat === 'number' && item.lat > 16)

  const defaultLat = isHanoi ? 21.0285 : 10.7981
  const defaultLng = isHanoi ? 105.8542 : 106.6543

  let inferredDistrict = item.district
  if (!inferredDistrict) {
    if (addressAndDistrict.includes('cầu giấy')) inferredDistrict = 'Cầu Giấy'
    else if (addressAndDistrict.includes('đống đa')) inferredDistrict = 'Đống Đa'
    else if (addressAndDistrict.includes('ba đình')) inferredDistrict = 'Ba Đình'
    else if (addressAndDistrict.includes('hoàn kiếm')) inferredDistrict = 'Hoàn Kiếm'
    else if (addressAndDistrict.includes('tây hồ')) inferredDistrict = 'Tây Hồ'
    else if (addressAndDistrict.includes('thanh xuân')) inferredDistrict = 'Thanh Xuân'
    else if (addressAndDistrict.includes('nam từ liêm')) inferredDistrict = 'Nam Từ Liêm'
    else if (addressAndDistrict.includes('bắc từ liêm')) inferredDistrict = 'Bắc Từ Liêm'
    else if (addressAndDistrict.includes('tân bình')) inferredDistrict = 'Tân Bình'
    else inferredDistrict = isHanoi ? 'Cầu Giấy' : 'Tân Bình'
  }

  let calculatedPrice = 400000
  if (item.depositType === 'fixed' && item.depositValue && item.depositValue > 1000) {
    calculatedPrice = Math.round(item.depositValue / 0.3)
  }

  return {
    id: item.id,
    name: item.name,
    district: inferredDistrict,
    city: isHanoi ? 'Hà Nội' : 'TP. Hồ Chí Minh',
    address: item.address,
    format: '7v7',
    surface: 'Cỏ nhân tạo',
    pricePerHour: calculatedPrice,
    rating: 5.0,
    reviewCount: 12,
    distanceKm: 2.1,
    imageUrl: item.imageUrl || '',
    gallery: item.images ?? [],
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
  const normalizedQuery = (filters.query || '').trim().toLowerCase()

  return fields
    .filter((field) => {
      const matchQuery =
        !normalizedQuery ||
        `${field.name} ${field.district} ${field.city} ${field.address}`
          .toLowerCase()
          .includes(normalizedQuery)

      const matchCity =
        !filters.city || filters.city === 'all' || field.city.toLowerCase().includes(filters.city.toLowerCase())

      const matchDistrict =
        !filters.district ||
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
  const [combinedFields, setCombinedFields] = useState<FootballField[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getPublicFields({
        search: query || undefined,
        district: district && district !== 'all' ? district : undefined,
        page,
        limit: 20,
      })

      if (res?.items && res.items.length > 0) {
        const mapped = res.items.map(mapBackendFieldToFootballField)
        setApiFields(mapped)

        setCombinedFields(mapped)
      } else {
        setApiFields([])
        setCombinedFields([])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách sân')
      setCombinedFields([])
    } finally {
      setLoading(false)
    }
  }, [query, district, page])

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  return { apiFields, combinedFields, loading, error, refetch: fetchFields }
}
