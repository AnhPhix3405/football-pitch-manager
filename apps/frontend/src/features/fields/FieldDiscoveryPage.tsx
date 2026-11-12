import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Button, Empty, Pagination, Select, Spin } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { BlurCircle } from '~/components/BlurCircle'
import { FieldCard } from './components/FieldCard'
import { FieldFilter } from './components/FieldFilter'
import { FieldMap } from './components/FieldMap'
import { filterAndSortFields, useFields } from './hooks/useFields'
import type { FieldFilters, FootballField } from './interface/field.types'

export function FieldDiscoveryPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showMap, setShowMap] = useState(true)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const filters: FieldFilters = useMemo(
    () => ({
      query: params.get('q') ?? '',
      city: params.get('city') ?? 'all',
      district: params.get('district') ?? 'all',
      format: (params.get('format') as FieldFilters['format']) ?? 'all',
      maxPrice: Number(params.get('maxPrice') ?? 1500000),
      availableOnly: params.get('available') === 'true',
      sort: (params.get('sort') as FieldFilters['sort']) ?? 'recommended',
    }),
    [params],
  )

  const changeFilters = (next: FieldFilters) => {
    const query = new URLSearchParams()
    if (next.query) query.set('q', next.query)
    if (next.city && next.city !== 'all') query.set('city', next.city)
    if (next.district && next.district !== 'all') query.set('district', next.district)
    if (next.format !== 'all') query.set('format', next.format)
    if (next.maxPrice < 1500000) query.set('maxPrice', String(next.maxPrice))
    if (next.availableOnly) query.set('available', 'true')
    if (next.sort !== 'recommended') query.set('sort', next.sort)
    setParams(query)
    setPage(1)
  }

  const { combinedFields, loading } = useFields(
    filters.query,
    filters.district,
    page,
  )

  const results = useMemo(
    () => filterAndSortFields(combinedFields, filters),
    [combinedFields, filters],
  )

  const pageSize = showMap ? 6 : 9
  const visible = results.slice((page - 1) * pageSize, page * pageSize)

  const selectedField = useMemo(
    () => results.find((f) => f.id === selectedFieldId) || results[0] || null,
    [results, selectedFieldId],
  )

  const isFiltered = Boolean(
    filters.query ||
    (filters.city && filters.city !== 'all') ||
    (filters.district && filters.district !== 'all') ||
    (filters.format && filters.format !== 'all') ||
    filters.maxPrice < 1500000 ||
    filters.availableOnly ||
    filters.sort !== 'recommended',
  )

  const handleResetFilters = () => {
    setParams(new URLSearchParams())
    setPage(1)
  }

  const handleSelectField = (field: FootballField) => {
    setSelectedFieldId(field.id)
  }

  return (
    <main className="discovery-page">
      {/* Ambient Blur Circles phát sáng nền phong cách PitchMaster */}
      <BlurCircle
        variant="lime"
        size={560}
        top="-40px"
        right="-80px"
        opacity={0.28}
        blur={120}
      />
      <BlurCircle
        variant="emerald"
        size={480}
        top="35%"
        left="-120px"
        opacity={0.22}
        blur={110}
      />
      <BlurCircle
        variant="blue"
        size={420}
        bottom="-40px"
        right="10%"
        opacity={0.16}
        blur={120}
      />

      <section className="discovery-head">
        <FieldFilter
          filters={filters}
          onChange={changeFilters}
          onReset={handleResetFilters}
          isFiltered={isFiltered}
        />

        <div className="view-actions">
          <Button
            icon={<UnorderedListOutlined />}
            onClick={() => setShowMap(false)}
            className={!showMap ? 'active' : ''}
          >
            {t('common.list', { defaultValue: 'Danh sách' })}
          </Button>
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => setShowMap(true)}
            className={showMap ? 'active' : ''}
          >
            {t('common.map', { defaultValue: 'Bản đồ' })}
          </Button>
        </div>
      </section>

      <div className={`discovery-layout${showMap ? '' : ' no-map'}`}>
        <div className="discovery-sidebar">
          <div className="result-toolbar">
            <div className="result-toolbar__count">
              <b>{results.length}</b> {t('fields.pitchesFound', { defaultValue: 'sân phù hợp' })}
            </div>
            <Select
              value={filters.sort}
              onChange={(sort) => changeFilters({ ...filters, sort })}
              options={[
                { value: 'recommended', label: 'Đề xuất' },
                { value: 'rating', label: 'Đánh giá cao' },
                { value: 'price-asc', label: 'Giá thấp nhất' },
              ]}
              popupMatchSelectWidth={false}
              className="result-toolbar__sort"
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : visible.length ? (
            <div className={`result-list${showMap ? ' result-list--compact' : ''}`}>
              {visible.map((field) => (
                <FieldCard
                  compact={showMap}
                  field={field}
                  key={field.id}
                  isSelected={selectedField?.id === field.id}
                  onSelect={handleSelectField}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-box" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <Empty
                description={t('fields.empty', { defaultValue: 'Không tìm thấy sân phù hợp với bộ lọc.' })}
              />
              {isFiltered && (
                <Button
                  onClick={handleResetFilters}
                  style={{ marginTop: 14 }}
                >
                  {t('fields.resetFilters', { defaultValue: 'Đặt lại bộ lọc' })}
                </Button>
              )}
            </div>
          )}

          <Pagination
            current={page}
            pageSize={pageSize}
            total={results.length}
            hideOnSinglePage
            onChange={setPage}
            style={{ marginTop: 20, textAlign: 'center' }}
          />
        </div>

        {showMap && (
          <FieldMap
            fields={results}
            selectedField={selectedField}
            city={filters.city || 'Hà Nội'}
            onSelectField={handleSelectField}
          />
        )}
      </div>
    </main>
  )
}
