import type { GeocodingPlace, NominatimRawResult } from '../interface/geocoding.types'

const CITY_VIEWBOX: Record<string, string> = {
  'Hà Nội': '105.65,21.20,106.05,20.85',
  'TP. Hồ Chí Minh': '106.55,10.95,106.85,10.65',
}

export async function searchPlacesNominatim(
  query: string,
  city = 'Hà Nội',
): Promise<GeocodingPlace[]> {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2) return []

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', trimmed)
    url.searchParams.set('format', 'json')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', '5')
    url.searchParams.set('countrycodes', 'vn')

    const viewbox = CITY_VIEWBOX[city]
    if (viewbox) {
      url.searchParams.set('viewbox', viewbox)
      url.searchParams.set('bounded', '0') // Ưu tiên khu vực trước nhưng vẫn tìm toàn quốc
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as NominatimRawResult[]

    return data.map((item) => {
      const parts = item.display_name.split(',')
      const shortName = parts[0]?.trim() || item.display_name

      return {
        placeId: item.place_id,
        shortName,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
      }
    })
  } catch {
    return []
  }
}

