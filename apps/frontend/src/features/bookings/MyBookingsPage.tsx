import { CalendarOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Modal, Segmented, Tag, message } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { userBookings, type BookingStatus } from '../user/user.data'

const labels: Record<BookingStatus, string> = { confirmed: 'ĐÃ XÁC NHẬN', pending: 'CHỜ ĐẶT CỌC', completed: 'HOÀN TẤT', cancelled: 'ĐÃ HỦY' }
export function MyBookingsPage() {
  const [filter, setFilter] = useState<'upcoming' | 'pending' | 'history'>('upcoming')
  const [cancelled, setCancelled] = useState<string[]>([])
  const [messageApi, contextHolder] = message.useMessage()
  const visible = userBookings.filter((booking) => !cancelled.includes(booking.id) && (filter === 'upcoming' ? booking.status === 'confirmed' : filter === 'pending' ? booking.status === 'pending' : ['completed', 'cancelled'].includes(booking.status)))
  const cancel = (id: string) => Modal.confirm({ title: 'Hủy lịch đặt sân?', content: 'Lịch sẽ được chuyển sang trạng thái đã hủy. Chính sách hoàn tiền phụ thuộc vào thời điểm hủy.', okText: 'Xác nhận hủy', okButtonProps: { danger: true }, cancelText: 'Giữ lịch', onOk: () => { setCancelled((items) => [...items, id]); messageApi.success('Đã hủy lịch đặt sân.') } })
  return <section className="user-page">{contextHolder}<header className="user-page__head"><div><span className="eyebrow">RESERVATION LOG</span><h1>Lịch đặt sân của tôi</h1><p>Quản lý trận sắp tới và xem lại lịch sử sử dụng sân.</p></div><Link to="/fields"><Button type="primary" icon={<PlusOutlined />}>Đặt sân mới</Button></Link></header><Segmented block value={filter} onChange={setFilter} options={[{ value: 'upcoming', label: 'Sắp tới' }, { value: 'pending', label: 'Chờ xử lý' }, { value: 'history', label: 'Lịch sử' }]} />{visible.length ? <div className="booking-card-grid">{visible.map((booking) => <article className="booking-card" key={booking.id}><div className="booking-card__visual"><img src={booking.image} alt={booking.field} /><Tag>{labels[booking.status]}</Tag></div><div className="booking-card__body"><h2>{booking.field}</h2><p><EnvironmentOutlined /> {booking.location}</p><dl><div><dt>NGÀY & GIỜ</dt><dd><CalendarOutlined /> {booking.date}<br />{booking.time}</dd></div><div><dt>TỔNG TIỀN</dt><dd className="lime">{formatPrice(booking.price)}</dd></div></dl><div><Button>Xem chi tiết</Button>{booking.status === 'confirmed' && <Button danger onClick={() => cancel(booking.id)}>Hủy lịch</Button>}{booking.status === 'pending' && <Button type="primary">Thanh toán cọc</Button>}</div></div></article>)}</div> : <Empty description="Không có lịch đặt sân trong mục này." />}</section>
}
