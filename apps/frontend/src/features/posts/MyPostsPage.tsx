import { PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Segmented } from 'antd'
import { useState } from 'react'
import { PostCard } from '../../components/posts/PostCard'
import { matchPosts } from '../user/user.data'
import type { MatchPost } from '../user/user.data'

export function MyPostsPage() {
  const [status, setStatus] = useState<MatchPost['status']>('open')
  const visible = matchPosts.filter((post) => post.status === status)
  return <section className="user-page"><header className="user-page__head"><div><span className="eyebrow">MY MATCH SIGNALS</span><h1>Bài đăng của tôi</h1><p>Quản lý các yêu cầu tìm đối và trạng thái ghép đội.</p></div><Button type="primary" icon={<PlusOutlined />}>Tạo yêu cầu mới</Button></header><Segmented value={status} onChange={setStatus} options={[{ value: 'open', label: 'Đang mở' }, { value: 'matched', label: 'Đã ghép' }, { value: 'closed', label: 'Đã đóng' }]} />{visible.length ? <div className="post-grid">{visible.map((post) => <PostCard post={post} manage key={post.id} />)}</div> : <Empty description="Không có bài đăng ở trạng thái này." />}</section>
}
