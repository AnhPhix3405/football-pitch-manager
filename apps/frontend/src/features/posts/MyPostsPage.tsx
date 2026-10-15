import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Empty, Segmented, Spin } from 'antd'
import { useState } from 'react'
import { matchPosts, type MatchPost } from '../user/user.data'
import { CreatePostModal } from './components/CreatePostModal'
import { PostCard } from './components/PostCard'
import { useMyPosts } from './hooks/useMyPosts'

export function MyPostsPage() {
  const [status, setStatus] = useState<MatchPost['status']>('open')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { apiPosts, loading, refetch } = useMyPosts(status)

  const visible = apiPosts.length > 0 ? apiPosts : matchPosts.filter((post) => post.status === status)

  return (
    <section className="user-page">
      <header className="user-page__head">
        <div>
          <span className="eyebrow">MY MATCH SIGNALS</span>
          <h1>Bài đăng của tôi</h1>
          <p>Quản lý các yêu cầu tìm đối và trạng thái ghép đội.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Tạo yêu cầu mới
          </Button>
        </div>
      </header>

      <Segmented
        value={status}
        onChange={(val) => setStatus(val as MatchPost['status'])}
        options={[
          { value: 'open', label: 'Đang mở' },
          { value: 'matched', label: 'Đã ghép' },
          { value: 'closed', label: 'Đã đóng' },
        ]}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : visible.length ? (
        <div className="post-grid">
          {visible.map((post) => (
            <PostCard post={post} manage key={post.id} />
          ))}
        </div>
      ) : (
        <Empty description="Không có bài đăng ở trạng thái này." />
      )}

      <CreatePostModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </section>
  )
}
