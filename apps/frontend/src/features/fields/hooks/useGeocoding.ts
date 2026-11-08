import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeocodingPlace } from '../interface/geocoding.types'
import { searchPlacesNominatim } from '../service/geocoding.service'

export function useGeocoding(city = 'Hà Nội') {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GeocodingPlace[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = useCallback(() => {
    setQuery('')
    setSuggestions([])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const places = await searchPlacesNominatim(trimmed, city)
      setSuggestions(places)
      setLoading(false)
    }, 400) // Debounce 400ms tuân thủ Nominatim usage policy

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query, city])

  return {
    query,
    setQuery,
    suggestions,
    loading,
    clear,
  }
}
