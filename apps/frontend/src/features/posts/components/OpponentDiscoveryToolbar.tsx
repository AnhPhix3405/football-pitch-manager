import { EnvironmentOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { AutoComplete, DatePicker, Input, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { filterLocationSuggestions } from '~/constants/location.constant'
import { useDebounce } from '~/hooks/useDebounce'
import { PillButton } from '../../../components/PillButton'
import type { OpponentFilterValues } from '../interface/post.types'

export interface OpponentDiscoveryToolbarProps {
  onFiltersChange: (filters: OpponentFilterValues) => void
  onRefresh: () => void
  onCreatePost: () => void
  loading?: boolean
  dynamicLocations?: string[]
}

export const OpponentDiscoveryToolbar = memo(function OpponentDiscoveryToolbar({
  onFiltersChange,
  onRefresh,
  onCreatePost,
  loading = false,
  dynamicLocations = [],
}: OpponentDiscoveryToolbarProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)

  // Debounce query tìm kiếm 1000ms (1 giây) sau khi người dùng dừng gõ
  const debouncedQuery = useDebounce(query, 1000)

  // Danh sách gợi ý địa điểm chuẩn hóa kèm icon & phân loại (phản hồi tức thì 0ms)
  const locationOptions = useMemo(() => {
    const suggestions = filterLocationSuggestions(query, dynamicLocations)
    return suggestions.map((item) => ({
      value: item.value,
      label: (
        <div className="location-suggestion-item">
          <span className="location-suggestion-item__main">
            <EnvironmentOutlined className="location-suggestion-item__icon" />
            <span className="location-suggestion-item__text">{item.value}</span>
          </span>
          <span className="location-suggestion-item__tag">
            {item.type === 'district' ? t('posts.districtType') : t('posts.venueType')}
          </span>
        </div>
      ),
    }))
  }, [query, dynamicLocations, t])

  // Chỉ phát sự kiện thay đổi bộ lọc khi debouncedQuery, level hoặc selectedDate thay đổi
  const isFirstMount = useRef(true)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : null
    onFiltersChange({
      search: debouncedQuery,
      skillLevel: level,
      playDate: formattedDate,
    })
  }, [debouncedQuery, level, selectedDate, onFiltersChange])

  // Khi chọn một địa điểm từ menu gợi ý -> áp dụng ngay lập tức
  const handleSelectLocation = (val: string) => {
    setQuery(val)
    const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : null
    onFiltersChange({
      search: val,
      skillLevel: level,
      playDate: formattedDate,
    })
  }

  // Khi nhấn nút Đặt lại (Reset)
  const handleReset = () => {
    setQuery('')
    setLevel('all')
    setSelectedDate(null)
    onFiltersChange({
      search: '',
      skillLevel: 'all',
      playDate: null,
    })
  }

  const hasActiveFilters = Boolean(query || level !== 'all' || selectedDate)

  return (
    <div className="opponent-discovery__toolbar">
      <div className="opponent-discovery__filters-left">
        <AutoComplete
          value={query}
          options={locationOptions}
          onSelect={handleSelectLocation}
          onChange={(val: string) => setQuery(val)}
          className="opponent-discovery__autocomplete"
        >
          <Input
            placeholder={t('posts.searchPlaceholder')}
            prefix={<FilterOutlined />}
            allowClear
            className="opponent-discovery__input"
          />
        </AutoComplete>

        <Select
          value={level}
          onChange={setLevel}
          className="opponent-discovery__select"
          options={[
            { value: 'all', label: t('posts.allSkills') },
            ...['Phong trào', 'Trung bình khá', 'Khá', 'Bán chuyên'].map((value) => ({
              value,
              label: value,
            })),
          ]}
        />

        <DatePicker
          placeholder={t('booking.flow.matchDate')}
          value={selectedDate}
          onChange={setSelectedDate}
          className="opponent-discovery__datepicker"
        />

        {hasActiveFilters && (
          <PillButton
            variant="secondary"
            size="sm"
            onClick={handleReset}
            text={t('common.reset')}
          />
        )}
      </div>

      <div className="opponent-discovery__actions-right">
        <PillButton
          variant="secondary"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        />
        <PillButton
          variant="primary"
          icon={<PlusOutlined />}
          onClick={onCreatePost}
          text={t('posts.createPost')}
        />
      </div>
    </div>
  )
})
