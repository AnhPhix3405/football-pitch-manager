import { memo, useEffect, useState } from 'react'
import {
  EnvironmentOutlined,
  FilterOutlined,
  GlobalOutlined,
  SlidersOutlined,
} from '@ant-design/icons'
import { Checkbox, Input, Popover, Select, Slider } from 'antd'
import { useTranslation } from 'react-i18next'
import { PillButton } from '~/components/PillButton'
import { HANOI_DISTRICTS, HCM_DISTRICTS } from '~/constants/field.constant'
import type { FieldFilters } from '../interface/field.types'

export interface FieldFilterProps {
  filters: FieldFilters
  onChange: (next: FieldFilters) => void
  onReset?: () => void
  isFiltered?: boolean
}

export const FieldFilter = memo(function FieldFilter({
  filters,
  onChange,
  onReset,
  isFiltered = false,
}: FieldFilterProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState(filters.query)

  const patch = <K extends keyof FieldFilters>(key: K, value: FieldFilters[K]) =>
    onChange({ ...filters, [key]: value })

  // Đồng bộ searchTerm khi query bên ngoài thay đổi
  useEffect(() => {
    setSearchTerm(filters.query)
  }, [filters.query])

  // Debounce 300ms cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.query) {
        onChange({ ...filters, query: searchTerm })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, filters, onChange])

  const currentCity = filters.city || 'Hà Nội'

  const availableDistricts =
    currentCity === 'Hà Nội'
      ? HANOI_DISTRICTS
      : currentCity === 'TP. Hồ Chí Minh'
        ? HCM_DISTRICTS
        : [...HANOI_DISTRICTS, ...HCM_DISTRICTS]

  const isPriceFiltered = filters.maxPrice < 1500000 || filters.availableOnly
  const priceLabel =
    filters.maxPrice < 1500000
      ? `≤ ${Math.round(filters.maxPrice / 1000)}k/h`
      : t('fields.price', { defaultValue: 'Mức giá' })

  const pricePopoverContent = (
    <div className="field-filter-popover">
      <div className="field-filter-popover__section">
        <div className="field-filter-popover__header">
          <span>{t('fields.maxPrice', { defaultValue: 'Mức giá tối đa' })}</span>
          <b className="field-filter-popover__val">{Math.round(filters.maxPrice / 1000)}K/giờ</b>
        </div>
        <Slider
          min={300000}
          max={1500000}
          step={50000}
          value={filters.maxPrice}
          onChange={(value) => patch('maxPrice', value)}
        />
      </div>
      <div className="field-filter-popover__section">
        <Checkbox
          checked={filters.availableOnly}
          onChange={(event) => patch('availableOnly', event.target.checked)}
        >
          {t('fields.availableTodayOnly', { defaultValue: 'Chỉ sân còn lịch hôm nay' })}
        </Checkbox>
      </div>
    </div>
  )

  return (
    <div className="field-filters-bar">
      {/* Tìm kiếm có Debounce */}
      <Input
        prefix={<FilterOutlined style={{ color: 'var(--muted)' }} />}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder={t('fields.searchPlaceholder', { defaultValue: 'Tìm theo tên sân, vị trí...' })}
        allowClear
        className="field-filters__input"
      />

      {/* Thành phố */}
      <Select
        value={currentCity}
        onChange={(value) => {
          onChange({ ...filters, city: value, district: 'all' })
        }}
        options={[
          { value: 'all', label: t('fields.allCities', { defaultValue: 'Tất cả TP' }) },
          { value: 'Hà Nội', label: 'Hà Nội' },
          { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
        ]}
        suffixIcon={<GlobalOutlined />}
        className="field-filters__select field-filters__select--city"
        popupMatchSelectWidth={false}
      />

      {/* Quận / Huyện */}
      <Select
        value={filters.district}
        onChange={(value) => patch('district', value)}
        options={[
          { value: 'all', label: t('fields.allDistricts', { defaultValue: 'Tất cả khu vực' }) },
          ...availableDistricts.map((d) => ({ value: d, label: d })),
        ]}
        suffixIcon={<EnvironmentOutlined />}
        className="field-filters__select field-filters__select--district"
        popupMatchSelectWidth={false}
      />

      {/* Loại sân */}
      <Select
        value={filters.format}
        onChange={(value) => patch('format', value)}
        options={[
          { value: 'all', label: t('fields.allTypes', { defaultValue: 'Tất cả loại sân' }) },
          { value: '5v5', label: 'Sân 5 (5v5)' },
          { value: '7v7', label: 'Sân 7 (7v7)' },
          { value: '11v11', label: 'Sân 11 (11v11)' },
        ]}
        className="field-filters__select field-filters__select--format"
        popupMatchSelectWidth={false}
      />

      {/* Mức giá & Tiện ích trong Popover */}
      <Popover
        content={pricePopoverContent}
        trigger="click"
        placement="bottomLeft"
        overlayClassName="field-filter-popover-overlay"
      >
        <button
          type="button"
          className={`field-filters__popover-trigger  ${isPriceFiltered ? 'field-filters__popover-trigger--active' : ''
            }`}
        >
          <SlidersOutlined />
          <span>{priceLabel}</span>
          {filters.availableOnly && <span className="field-filters__badge-dot" />}
        </button>
      </Popover>

      {/* Nút Đặt lại khi có filter hoạt động */}
      {isFiltered && onReset && (
        <PillButton
          variant="secondary"
          size="sm"
          onClick={onReset}
          text={t('common.reset', { defaultValue: 'Đặt lại' })}
          className="field-filters__reset-btn"
        />
      )}
    </div>
  )
})
