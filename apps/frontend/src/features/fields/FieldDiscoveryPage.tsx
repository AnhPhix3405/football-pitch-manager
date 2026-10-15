import { AppstoreOutlined, EnvironmentOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Button, Empty, Pagination, Select, Spin } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FieldCard } from './components/FieldCard'
import { FieldFilter } from './components/FieldFilter'
import { footballFields } from './field.data'
import { filterAndSortFields, useFields } from './hooks/useFields'
import type { FieldFilters } from './interface/field.types'

const pageSize = 4

export function FieldDiscoveryPage() {
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showMap, setShowMap] = useState(true)

  const filters: FieldFilters = useMemo(
    () => ({
      query: params.get('q') ?? '',
      district: params.get('district') ?? 'all',
      format: (params.get('format') as FieldFilters['format']) ?? 'all',
      maxPrice: Number(params.get('maxPrice') ?? 1300000),
      availableOnly: params.get('available') === 'true',
      sort: (params.get('sort') as FieldFilters['sort']) ?? 'recommended',
    }),
    [params],
  )

  const changeFilters = (next: FieldFilters) => {
    const query = new URLSearchParams()
    if (next.query) query.set('q', next.query)
    if (next.district !== 'all') query.set('district', next.district)
    if (next.format !== 'all') query.set('format', next.format)
    if (next.maxPrice < 1300000) query.set('maxPrice', String(next.maxPrice))
    if (next.availableOnly) query.set('available', 'true')
    if (next.sort !== 'recommended') query.set('sort', next.sort)
    setParams(query)
    setPage(1)
  }

  const { apiFields, loading } = useFields(filters.query, filters.district, page)

  const dataSource = apiFields.length > 0 ? apiFields : footballFields
  const results = useMemo(() => filterAndSortFields(dataSource, filters), [dataSource, filters])
  const visible = results.slice((page - 1) * pageSize, page * pageSize)

  return (
    <main className="discovery-page">
      <section className="discovery-head">
        <div>
          <span className="eyebrow">FIELD DISCOVERY NODE</span>
          <h1>Tìm sân phù hợp</h1>
          <p>Quét mạng lưới sân bóng đã xác minh quanh bạn.</p>
        </div>
        <div className="view-actions">
          <Button
            icon={<UnorderedListOutlined />}
            onClick={() => setShowMap(false)}
            className={!showMap ? 'active' : ''}
          >
            Danh sách
          </Button>
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => setShowMap(true)}
            className={showMap ? 'active' : ''}
          >
            Bản đồ
          </Button>
        </div>
      </section>

      <div className={`discovery-layout${showMap ? '' : ' no-map'}`}>
        <div className="discovery-sidebar">
          <FieldFilter filters={filters} onChange={changeFilters} />
          <div className="result-toolbar">
            <b>{results.length} sân được tìm thấy</b>
            <Select
              value={filters.sort}
              onChange={(sort) => changeFilters({ ...filters, sort })}
              options={[
                { value: 'recommended', label: 'Đề xuất' },
                { value: 'rating', label: 'Đánh giá cao' },
                { value: 'price-asc', label: 'Giá thấp nhất' },
              ]}
            />
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : visible.length ? (
            <div className="result-list">
              {visible.map((field) => (
                <FieldCard compact field={field} key={field.id} />
              ))}
            </div>
          ) : (
            <Empty description="Không có sân phù hợp. Hãy thử nới bộ lọc." />
          )}
          <Pagination
            current={page}
            pageSize={pageSize}
            total={results.length}
            hideOnSinglePage
            onChange={setPage}
          />
        </div>

        {showMap && (
          <div className="field-network-map">
            <div className="map-grid" />
            <span className="map-location">
              <EnvironmentOutlined /> Vị trí của bạn
            </span>
            {results.map((field) => (
              <Link
                to={`/app/fields/${field.id}`}
                key={field.id}
                className="map-pin"
                style={{ left: `${field.coordinates.x}%`, top: `${field.coordinates.y}%` }}
                aria-label={`Xem ${field.name}`}
              >
                <i />
                <span>{field.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
