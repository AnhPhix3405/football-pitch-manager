import { EnvironmentOutlined, SearchOutlined } from '@ant-design/icons'
import { Checkbox, Input, Select, Slider } from 'antd'
import { useTranslation } from 'react-i18next'
import type { FieldFilters } from '../interface/field.types'

export function FieldFilter({
  filters,
  onChange,
}: {
  filters: FieldFilters
  onChange: (next: FieldFilters) => void
}) {
  const { t } = useTranslation()
  const patch = <K extends keyof FieldFilters>(key: K, value: FieldFilters[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <aside className="field-filters">
      <span className="eyebrow">SEARCH PARAMETERS</span>
      <h2>{t('common.filter')}</h2>
      <label>
        {t('common.search')}
        <Input
          prefix={<SearchOutlined />}
          value={filters.query}
          onChange={(event) => patch('query', event.target.value)}
          placeholder={t('fields.searchPlaceholder')}
        />
      </label>
      <label>
        {t('fields.district')}
        <Select
          value={filters.district}
          onChange={(value) => patch('district', value)}
          options={[
            { value: 'all', label: t('fields.allDistricts') },
            ...['Quận 7', 'Bình Thạnh', 'Thủ Đức', 'Quận 2', 'Quận 9', 'Hoàn Kiếm'].map(
              (value) => ({ value, label: value }),
            ),
          ]}
          suffixIcon={<EnvironmentOutlined />}
        />
      </label>
      <label>
        {t('fields.type', { defaultValue: 'LOẠI SÂN' })}
        <Select
          value={filters.format}
          onChange={(value) => patch('format', value)}
          options={[
            { value: 'all', label: t('fields.allTypes', { defaultValue: 'Tất cả loại sân' }) },
            { value: '5v5', label: 'Sân 5 người' },
            { value: '7v7', label: 'Sân 7 người' },
            { value: '11v11', label: 'Sân 11 người' },
          ]}
        />
      </label>
      <label>
        {t('fields.price')}{' '}
        <b>{Math.round(filters.maxPrice / 1000)}K/giờ</b>
        <Slider
          min={300000}
          max={1300000}
          step={50000}
          value={filters.maxPrice}
          onChange={(value) => patch('maxPrice', value)}
        />
      </label>
      <Checkbox
        checked={filters.availableOnly}
        onChange={(event) => patch('availableOnly', event.target.checked)}
      >
        Chỉ sân còn lịch hôm nay
      </Checkbox>
    </aside>
  )
}
