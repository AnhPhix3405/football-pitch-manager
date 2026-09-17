import { CalendarOutlined, SearchOutlined } from '@ant-design/icons'
import { Input, Select, Table, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { ownerBookings } from './owner.data'

export function OwnerBookingsPage() {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('all'); const visible = useMemo(() => ownerBookings.filter((booking) => (status === 'all' || booking.status === status) && (!query || `${booking.customer} ${booking.id} ${booking.field}`.toLowerCase().includes(query.toLowerCase()))), [query, status])
  return <section className="owner-page"><header className="user-page__head"><div><span className="eyebrow">RESERVATION CONTROL</span><h1>Quản lý booking</h1><p>Theo dõi, xác nhận và xử lý lịch đặt sân.</p></div></header><div className="owner-toolbar"><Input prefix={<SearchOutlined />} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mã booking, khách hàng..." /><Select value={status} onChange={setStatus} options={[{ value: 'all', label: 'Tất cả trạng thái' }, { value: 'confirmed', label: 'Đã xác nhận' }, { value: 'pending', label: 'Chờ xử lý' }, { value: 'cancelled', label: 'Đã hủy' }]} /></div><Table rowKey="id" dataSource={visible} scroll={{ x: 800 }} columns={[{ title: 'BOOKING', render: (_, item) => <Link to={`/owner/bookings/${item.id}`}><b>{item.id}</b><small className="table-sub">{item.customer}</small></Link> }, { title: 'SÂN', dataIndex: 'field' }, { title: 'LỊCH', render: (_, item) => <><CalendarOutlined /> {item.date}<small className="table-sub">{item.time}</small></> }, { title: 'TỔNG TIỀN', render: (_, item) => formatPrice(item.amount) }, { title: 'TRẠNG THÁI', render: (_, item) => <Tag color={item.status === 'confirmed' ? 'green' : 'gold'}>{item.status}</Tag> }]} /></section>
}
