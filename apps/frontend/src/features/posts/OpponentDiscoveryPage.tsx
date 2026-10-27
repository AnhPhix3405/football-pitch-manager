import { FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { DatePicker, Empty, Input, Select, Spin } from 'antd'
import type { Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PillButton } from '../../components/PillButton'
import { matchPosts } from '../user/user.data'
import { CreatePostModal } from './components/CreatePostModal'
import { PostCard } from './components/PostCard'
import { filterPosts, usePublicPosts } from './hooks/usePublicPosts'

export function OpponentDiscoveryPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : null
  const { apiPosts, loading, refetch } = usePublicPosts(query, level, formattedDate)

  const visible = useMemo(() => {
    const dataSource = apiPosts.length > 0 ? apiPosts : matchPosts
    return filterPosts(dataSource, query, level, formattedDate)
  }, [apiPosts, query, level, formattedDate])

  return (
    <section className="user-page">
      <header className="user-page__head">
        <div>
          <span className="eyebrow">{t('posts.eyebrow')}</span>
          <h1>{t('posts.title')}</h1>
          <p>{t('posts.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <PillButton
            variant="secondary"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={loading}
            text={t('common.refresh')}
          />
          <PillButton
            variant="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            text={t('posts.createPost')}
          />
        </div>
      </header>

      <div className="opponent-filters">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('posts.searchPlaceholder')}
          prefix={<FilterOutlined />}
          allowClear
        />
        <Select
          value={level}
          onChange={setLevel}
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
        />
        <PillButton
          variant="secondary"
          size="sm"
          onClick={() => {
            setQuery('')
            setLevel('all')
            setSelectedDate(null)
          }}
          text={t('common.reset')}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : visible.length ? (
        <div className="post-grid">
          {visible.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      ) : (
        <Empty description={t('posts.empty')} />
      )}

      <CreatePostModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </section>
  )
}
