import { useEffect, useRef, useState } from 'react'
import {
  CompassOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { useGeocoding } from '../hooks/useGeocoding'
import type { GeocodingPlace } from '../interface/geocoding.types'

export interface MapSearchBarProps {
  city?: string
  onSelectPlace: (place: GeocodingPlace) => void
}

export function MapSearchBar({ city = 'Hà Nội', onSelectPlace }: MapSearchBarProps) {
  const { t } = useTranslation()
  const { query, setQuery, suggestions, loading, clear } = useGeocoding(city)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (place: GeocodingPlace) => {
    setQuery(place.shortName)
    setOpen(false)
    onSelectPlace(place)
  }

  return (
    <div className="map-search-bar" ref={wrapperRef}>
      <Input
        prefix={
          loading ? (
            <LoadingOutlined style={{ color: 'var(--lime)' }} />
          ) : (
            <CompassOutlined style={{ color: 'var(--lime)' }} />
          )
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        placeholder={t('fields.searchPlacePlaceholder', {
          defaultValue: 'Tìm địa chỉ, đường phố (vd: Hồ Gươm, Mỹ Đình, Keangnam...)',
        })}
        allowClear
        onClear={clear}
        className="map-search-bar__input"
      />

      {open && suggestions.length > 0 && (
        <ul className="map-search-bar__dropdown">
          {suggestions.map((place) => (
            <li
              key={place.placeId}
              onClick={() => handleSelect(place)}
              className="map-search-bar__item"
            >
              <EnvironmentOutlined className="map-search-bar__item-icon" />
              <div className="map-search-bar__item-text">
                <b>{place.shortName}</b>
                <span>{place.displayName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

