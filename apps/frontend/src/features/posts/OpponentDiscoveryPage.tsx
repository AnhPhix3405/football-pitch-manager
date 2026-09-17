import { FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, DatePicker, Empty, Input, Select } from 'antd'
import { useMemo, useState } from 'react'
import { PostCard } from '../../components/posts/PostCard'
import { matchPosts } from '../user/user.data'

export function OpponentDiscoveryPage() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')
  const visible = useMemo(() => matchPosts.filter((post) => post.status === 'open' && (level === 'all' || post.level === level) && (!query || `${post.title} ${post.location} ${post.team}`.toLowerCase().includes(query.toLowerCase()))), [level, query])
  return <section className="user-page"><header className="user-page__head"><div><span className="eyebrow">MATCHMAKING NETWORK</span><h1>Tìm đối thủ</h1><p>Lọc theo trình độ và khu vực để tìm kèo phù hợp.</p></div><Button type="primary" icon={<PlusOutlined />}>Đăng yêu cầu</Button></header><div className="opponent-filters"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm đội, khu vực..." prefix={<FilterOutlined />} /><Select value={level} onChange={setLevel} options={[{ value: 'all', label: 'Mọi trình độ' }, ...['Phong trào', 'Trung bình khá', 'Khá'].map((value) => ({ value, label: value }))]} /><DatePicker placeholder="Chọn ngày" /><Button onClick={() => { setQuery(''); setLevel('all') }}>Đặt lại</Button></div>{visible.length ? <div className="post-grid">{visible.map((post) => <PostCard post={post} key={post.id} />)}</div> : <Empty description="Chưa tìm thấy kèo phù hợp." />}</section>
}
