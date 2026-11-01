export interface LocationSuggestion {
  value: string
  type: 'district' | 'venue'
}

export const POPULAR_LOCATIONS: LocationSuggestion[] = [
  // Khu vực / Quận huyện tiêu biểu
  { value: 'Quận 7', type: 'district' },
  { value: 'Bình Thạnh', type: 'district' },
  { value: 'Thủ Đức', type: 'district' },
  { value: 'Tân Bình', type: 'district' },
  { value: 'Quận 1', type: 'district' },
  { value: 'Quận 2', type: 'district' },
  { value: 'Quận 10', type: 'district' },
  { value: 'Phú Nhuận', type: 'district' },
  { value: 'Gò Vấp', type: 'district' },
  { value: 'Quận 8', type: 'district' },
  { value: 'Tân Phú', type: 'district' },
  // Cụm sân bóng tiêu biểu
  { value: 'Sân Chảo Lửa', type: 'venue' },
  { value: 'Terminal Alpha Pitch', type: 'venue' },
  { value: 'North Grid Arena', type: 'venue' },
  { value: 'Hackney Masters', type: 'venue' },
  { value: 'River Eleven Park', type: 'venue' },
  { value: 'Emeralds 5-a-Side', type: 'venue' },
  { value: 'Sân Lam Sơn', type: 'venue' },
  { value: 'Sân K334', type: 'venue' },
]

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

export function filterLocationSuggestions(
  input: string,
  additionalLocations: string[] = [],
): LocationSuggestion[] {
  const raw = input.trim()
  const normalizedInput = removeVietnameseTones(raw)

  // Gộp danh sách tĩnh và các địa điểm động từ bài đăng thực tế
  const dynamicItems: LocationSuggestion[] = additionalLocations
    .filter((loc) => loc && !POPULAR_LOCATIONS.some((p) => p.value.toLowerCase() === loc.toLowerCase()))
    .map((loc) => ({ value: loc, type: 'venue' as const }))

  const allLocations: LocationSuggestion[] = [...POPULAR_LOCATIONS, ...dynamicItems]

  if (!raw) {
    return allLocations.slice(0, 8)
  }

  return allLocations.filter((item) => {
    const normalizedValue = removeVietnameseTones(item.value)
    if (normalizedValue.includes(normalizedInput)) return true

    // Hỗ trợ gõ tắt nhanh như q7, q1, q10
    if (normalizedInput.startsWith('q') && normalizedValue.startsWith('quan ')) {
      const num = normalizedInput.replace('q', '').trim()
      const targetNum = normalizedValue.replace('quan ', '').trim()
      if (num && targetNum.startsWith(num)) return true
    }

    return false
  })
}
