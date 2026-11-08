import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AimOutlined,
  CompassOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button, Tooltip, message } from 'antd'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createRoot, type Root } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { FootballField } from '../interface/field.types'
import type { GeocodingPlace } from '../interface/geocoding.types'
import { FieldMapPopup } from './FieldMapPopup'
import { MapSearchBar } from './MapSearchBar'

export interface FieldMapProps {
  fields: FootballField[]
  selectedField: FootballField | null
  city?: string
  onSelectField?: (field: FootballField) => void
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Hà Nội': [21.0285, 105.8342],
  'TP. Hồ Chí Minh': [10.7981, 106.6743],
}

export function FieldMap({
  fields,
  selectedField,
  city = 'Hà Nội',
  onSelectField,
}: FieldMapProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const rootsRef = useRef<Root[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  const searchMarkerRef = useRef<L.Marker | null>(null)
  const [locating, setLocating] = useState(false)

  // Khởi tạo Leaflet Map với OpenStreetMap tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialCenter = CITY_COORDINATES[city] || [21.0285, 105.8342]

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [city])

  // Cập nhật center khi thay đổi thành phố (Hà Nội / TP.HCM)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const targetCoords = CITY_COORDINATES[city]
    if (targetCoords) {
      map.flyTo(targetCoords, 13, { duration: 1.2 })
    }
  }, [city])

  // Vẽ các markers sân bóng lên bản đồ
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Xóa markers cũ và unmount roots cũ
    rootsRef.current.forEach((root) => {
      try {
        root.unmount()
      } catch {
        // ignore
      }
    })
    rootsRef.current = []

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    fields.forEach((field) => {
      const lat = field.lat ?? (city === 'Hà Nội' ? 21.0285 : 10.7981)
      const lng = field.lng ?? (city === 'Hà Nội' ? 105.8542 : 106.6543)

      const isSelected = selectedField?.id === field.id

      const iconHtml = `
        <div class="pitch-marker ${isSelected ? 'pitch-marker--selected' : ''}">
          <div class="pitch-marker__dot"></div>
          <div class="pitch-marker__badge">
            <b>${field.name.split(' ').slice(0, 3).join(' ')}</b>
            <span>${Math.round(field.pricePerHour / 1000)}k</span>
          </div>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'pitch-marker-wrap',
        html: iconHtml,
        iconSize: [120, 40],
        iconAnchor: [60, 20],
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

      // Xây dựng Popup chi tiết bằng React Component FieldMapPopup
      const popupContainer = document.createElement('div')
      const root = createRoot(popupContainer)
      rootsRef.current.push(root)

      root.render(
        <FieldMapPopup
          field={field}
          onViewDetail={() => navigate(`/fields/${field.id}`)}
        />,
      )

      marker.bindPopup(popupContainer, {
        className: 'custom-pitch-popup',
        maxWidth: 320,
        minWidth: 280,
        autoPan: true,
        autoPanPaddingTopLeft: L.point(40, 90),
        autoPanPaddingBottomRight: L.point(40, 40),
      })

      marker.on('click', () => {
        onSelectField?.(field)
      })

      markersRef.current.set(field.id, marker)
    })

    return () => {
      rootsRef.current.forEach((root) => {
        try {
          root.unmount()
        } catch {
          // ignore
        }
      })
      rootsRef.current = []
    }
  }, [fields, selectedField, city, navigate, onSelectField])

  // Fly to sân khi được chọn từ danh sách hoặc click marker
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedField) return

    const lat = selectedField.lat
    const lng = selectedField.lng
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1.0 })
      const marker = markersRef.current.get(selectedField.id)
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup()
      }
    }
  }, [selectedField])

  // Định vị khi chọn một địa điểm từ Nominatim Geocoding Search Bar
  const handleSelectPlace = useCallback((place: GeocodingPlace) => {
    const map = mapInstanceRef.current
    if (!map) return

    map.flyTo([place.lat, place.lng], 16, { duration: 1.5 })

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove()
    }

    const landmarkIcon = L.divIcon({
      className: 'searched-dot-marker-wrap',
      html: `
        <div class="searched-dot-marker" title="${place.shortName}">
          <div class="searched-dot-pulse"></div>
          <div class="searched-dot-core"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14],
    })

    const marker = L.marker([place.lat, place.lng], { icon: landmarkIcon })
      .addTo(map)
      .bindPopup(
        `<div class="searched-place-popup">
          <div class="searched-place-popup__badge">📍 ${t('fields.searchedLocationBadge', { defaultValue: 'VỊ TRÍ TÌM KIẾM' })}</div>
          <h4 class="searched-place-popup__title">${place.shortName}</h4>
          <p class="searched-place-popup__address">${place.displayName}</p>
          <div class="searched-place-popup__coords">
            <span>${t('fields.coordinates', { defaultValue: 'Tọa độ' })}: ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</span>
          </div>
        </div>`,
        {
          className: 'custom-pitch-popup custom-searched-popup',
          maxWidth: 300,
          minWidth: 240,
        },
      )
      .openPopup()

    searchMarkerRef.current = marker
    message.success(`Đã định vị: ${place.shortName}`)
  }, [t])

  // Định vị Geolocation người dùng
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      message.warning('Trình duyệt của bạn không hỗ trợ định vị GPS.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const { latitude, longitude } = pos.coords
        const map = mapInstanceRef.current
        if (!map) return

        map.flyTo([latitude, longitude], 15, { duration: 1.5 })

        // Xóa marker cũ nếu có
        if (userMarkerRef.current) {
          userMarkerRef.current.remove()
        }

        const userIcon = L.divIcon({
          className: 'user-gps-marker-wrap',
          html: `<div class="user-gps-marker"><div class="user-gps-pulse"></div><div class="user-gps-dot"></div></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -14],
        })

        const marker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .openPopup()

        userMarkerRef.current = marker
        message.success('Đã xác định vị trí hiện tại của bạn!')
      },
      () => {
        setLocating(false)
        message.info(
          'Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập vị trí trên trình duyệt.',
        )
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }, [])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleResetView = () => {
    const coords = CITY_COORDINATES[city] || [21.0285, 105.8342]
    mapInstanceRef.current?.flyTo(coords, 13, { duration: 1 })
  }

  return (
    <div className="field-map-container">
      {/* Thanh tìm kiếm địa chỉ đường phố Nominatim OpenStreetMap */}
      <MapSearchBar city={city} onSelectPlace={handleSelectPlace} />

      {/* Container DOM cho Leaflet */}
      <div ref={mapContainerRef} className="field-map-canvas" />

      {/* Nút hành động nổi trên bản đồ */}
      <div className="field-map-controls">

        <Button
          type="primary"
          icon={<AimOutlined />}
          loading={locating}
          onClick={handleLocateUser}
          className="field-map-control-btn field-map-control-btn--gps"
        >
          <span>{t('fields.myLocation', { defaultValue: 'Vị trí của bạn' })}</span>
        </Button>
        <div className="field-map-zoom-group">
          <Tooltip title="Phóng to" placement="left">
            <Button icon={<PlusOutlined />} onClick={handleZoomIn} />
          </Tooltip>
          <Tooltip title="Thu nhỏ" placement="left">
            <Button icon={<MinusOutlined />} onClick={handleZoomOut} />
          </Tooltip>
          <Tooltip title="Về trung tâm thành phố" placement="left">
            <Button icon={<CompassOutlined />} onClick={handleResetView} />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
