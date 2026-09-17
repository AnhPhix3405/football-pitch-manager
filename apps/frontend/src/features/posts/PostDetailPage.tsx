import { CalendarOutlined, EnvironmentOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Input, Modal, Tag, message } from 'antd'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { matchPosts } from '../user/user.data'

const applicants = ['FC Hackney Lads', 'Red Star North', 'Casual Kickers']
export function PostDetailPage() {
  const { postId = '' } = useParams()
  const post = matchPosts.find((item) => item.id === postId)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(['Đội mình sẵn sàng thi đấu tối thứ bảy. Có cần chuẩn bị bóng không?'])
  const [resolved, setResolved] = useState<string[]>([])
  const [messageApi, contextHolder] = message.useMessage()
  if (!post) return <section className="user-page">Không tìm thấy bài đăng. <Link to="/app/posts">Quay lại</Link></section>
  const decide = (team: string, accept: boolean) => Modal.confirm({ title: accept ? `Chấp nhận ${team}?` : `Từ chối ${team}?`, content: accept ? 'Đội này sẽ được ghép vào trận đấu và nhận thông báo.' : 'Ứng viên sẽ nhận thông báo từ chối.', onOk: () => { setResolved((items) => [...items, team]); messageApi.success(accept ? 'Đã ghép đội thành công.' : 'Đã từ chối ứng viên.') } })
  const send = () => { if (!comment.trim()) return; setComments((items) => [...items, comment.trim()]); setComment('') }
  return <section className="user-page">{contextHolder}<Link className="back-link" to="/app/posts">← Trở lại bài đăng</Link><div className="post-detail-grid"><article className="post-detail"><header><Tag color="green">MATCH REQUEST</Tag><Tag>{post.status.toUpperCase()}</Tag></header><h1>{post.title}</h1><div className="post-metadata"><span><EnvironmentOutlined /> {post.location}</span><span><CalendarOutlined /> {post.date} · {post.time}</span><span><TeamOutlined /> {post.format} · {post.level}</span></div><p>{post.description}</p></article><aside className="applicant-panel"><header><h2>Ứng viên</h2><Tag color="green">{applicants.length} PENDING</Tag></header>{applicants.filter((team) => !resolved.includes(team)).map((team) => <div className="applicant" key={team}><b>{team}</b><span>LEVEL: INTERMEDIATE</span><div><Button type="primary" onClick={() => decide(team, true)}>Chấp nhận</Button><Button onClick={() => decide(team, false)}>Từ chối</Button></div></div>)}</aside><section className="discussion"><h2>Thảo luận ({comments.length})</h2>{comments.map((item, index) => <blockquote key={`${item}-${index}`}><b>{index ? 'Bạn' : 'FC Hackney Lads'}</b><p>{item}</p></blockquote>)}<Input value={comment} onChange={(event) => setComment(event.target.value)} onPressEnter={send} placeholder="Thêm bình luận công khai..." suffix={<Button type="text" icon={<SendOutlined />} onClick={send} aria-label="Gửi bình luận" />} /></section></div></section>
}
