import { useEffect, useState } from 'react'

export interface GeoLocationState {
  lat: number | null
  lng: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(): GeoLocationState {
  const [state, setState] = useState<GeoLocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        lat: null,
        lng: null,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        setState({
          lat: null,
          lng: null,
          error: error.message,
          loading: false,
        })
      },
    )
  }, [])

  return state
}
