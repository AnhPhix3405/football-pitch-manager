export interface NominatimRawResult {
  place_id: number
  licence?: string
  osm_type?: string
  osm_id?: number
  boundingbox?: [string, string, string, string]
  lat: string
  lon: string
  display_name: string
  class?: string
  type?: string
  importance?: number
}

export interface GeocodingPlace {
  placeId: number
  displayName: string
  shortName: string
  lat: number
  lng: number
  type?: string
}

