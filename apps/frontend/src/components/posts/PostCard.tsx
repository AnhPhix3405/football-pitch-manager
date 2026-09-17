import { CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import { Link } from 'react-router-dom'
import type { MatchPost } from '../../features/user/user.data'

export function PostCard({ post, manage = false }: { post: MatchPost; manage?: boolean }) {
  return <article className="post-card"><header><Tag color="green">{post.format}</Tag><Tag>{post.level}</Tag><span>{post.status.toUpperCase()}</span></header><h2>{post.title}</h2><p>Đăng bởi <b>{post.team}</b></p><dl><div><dt><CalendarOutlined /> THỜI GIAN</dt><dd>{post.date} · {post.time}</dd></div><div><dt><EnvironmentOutlined /> ĐỊA ĐIỂM</dt><dd>{post.location}</dd></div><div><dt><TeamOutlined /> ĐANG CẦN</dt><dd>{post.needed ? `${post.needed} ${post.needed > 1 ? 'người' : 'đội'}` : 'Đã ghép đủ'}</dd></div></dl><footer><span>{post.applicants} lượt quan tâm</span><Link to={`/app/posts/${post.id}`}><Button>{manage ? 'Quản lý' : 'Xem kèo'}</Button></Link></footer></article>
}
