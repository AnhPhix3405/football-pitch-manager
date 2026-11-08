import type { FieldFormat, FieldSurface } from '../../../constants'

export type { FieldFormat, FieldSurface }

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
  lat?: number
  lng?: number
  featured: boolean
  availableToday: boolean
  hasOwnerAccount: boolean
  phone?: string
}

export interface FieldFilters {
  query: string
  city?: string
  district: string
  format: FieldFormat | 'all'
  maxPrice: number
  availableOnly: boolean
  sort: 'recommended' | 'rating' | 'price-asc'
}
