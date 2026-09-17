export type FieldFormat = '5v5' | '7v7' | '11v11'
export type FieldSurface = 'Cỏ nhân tạo' | 'Cỏ tự nhiên'

export interface FootballField {
  id: string
  name: string
  district: string
  city: string
  address: string
  format: FieldFormat
  surface: FieldSurface
  pricePerHour: number
  rating: number
  reviewCount: number
  distanceKm: number
  imageUrl: string
  gallery: string[]
  amenities: string[]
  description: string
  coordinates: { x: number; y: number }
  featured: boolean
  availableToday: boolean
}

export interface FieldFilters {
  query: string
  district: string
  format: FieldFormat | 'all'
  maxPrice: number
  availableOnly: boolean
  sort: 'recommended' | 'rating' | 'price-asc'
}
