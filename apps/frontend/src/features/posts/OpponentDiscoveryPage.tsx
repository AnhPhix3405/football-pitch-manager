import { FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, DatePicker, Empty, Input, Select, Spin } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { matchPosts } from '../user/user.data'
import { CreatePostModal } from './components/CreatePostModal'
import { PostCard } from './components/PostCard'
import { filterPosts, usePublicPosts } from './hooks/usePublicPosts'

export function OpponentDiscoveryPage() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
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
          <span className="eyebrow">MATCHMAKING NETWORK</span>
          <h1>Tìm đối thủ</h1>
          <p>Lọc theo trình độ và khu vực để tìm kèo phù hợp hoặc đăng bài tìm đối mới.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Đăng yêu cầu
          </Button>
        </div>
      </header>

      <div className="opponent-filters">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm đội, khu vực..."
          prefix={<FilterOutlined />}
          allowClear
        />
        <Select
          value={level}
          onChange={setLevel}
          options={[
            { value: 'all', label: 'Mọi trình độ' },
            ...['Phong trào', 'Trung bình khá', 'Khá', 'Bán chuyên'].map((value) => ({
              value,
              label: value,
            })),
          ]}
        />
        <DatePicker
          placeholder="Chọn ngày thi đấu"
          value={selectedDate}
          onChange={setSelectedDate}
        />
        <Button
          onClick={() => {
            setQuery('')
            setLevel('all')
            setSelectedDate(null)
          }}
        >
          Đặt lại
        </Button>
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
        <Empty description="Chưa tìm thấy kèo phù hợp. Hãy thử thay đổi bộ lọc hoặc tạo bài đăng mới." />
      )}

      <CreatePostModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </section>
  )
}
