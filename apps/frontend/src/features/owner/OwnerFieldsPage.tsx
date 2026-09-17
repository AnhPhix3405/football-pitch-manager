import { EditOutlined, EnvironmentOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Dropdown, Empty, Tag, message } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { ownerFields } from './owner.data'

export function OwnerFieldsPage() {
  const [removed, setRemoved] = useState<string[]>([])
  const [messageApi, contextHolder] = message.useMessage()
  const visible = ownerFields.filter((field) => !removed.includes(field.id))
  return <section className="owner-page">{contextHolder}<header className="user-page__head"><div><span className="eyebrow">FACILITY INVENTORY</span><h1>Sân của tôi</h1><p>Quản lý trạng thái, thông tin và lịch vận hành.</p></div><Link to="/owner/fields/new"><Button type="primary" icon={<PlusOutlined />}>Thêm sân mới</Button></Link></header>{visible.length ? <div className="owner-field-grid">{visible.map((field) => <article key={field.id}><img src={field.image} alt={field.name} /><div><header><Tag color={field.status === 'active' ? 'green' : 'gold'}>{field.status.toUpperCase()}</Tag><Dropdown menu={{ items: [{ key: 'maintenance', label: 'Chuyển sang bảo trì' }, { key: 'delete', danger: true, label: 'Xóa sân', onClick: () => { setRemoved((items) => [...items, field.id]); messageApi.success('Đã xóa sân khỏi danh sách.') } }] }}><Button type="text" icon={<MoreOutlined />} /></Dropdown></header><h2>{field.name}</h2><p><EnvironmentOutlined /> {field.address}</p><dl><div><dt>LOẠI SÂN</dt><dd>{field.format}</dd></div><div><dt>GIÁ CƠ BẢN</dt><dd>{formatPrice(field.price)}/giờ</dd></div><div><dt>BOOKING HÔM NAY</dt><dd>{field.bookingsToday}</dd></div></dl><Link to={`/owner/fields/${field.id}/edit`}><Button block icon={<EditOutlined />}>Chỉnh sửa sân</Button></Link></div></article>)}</div> : <Empty description="Bạn chưa có sân nào." />}</section>
}
