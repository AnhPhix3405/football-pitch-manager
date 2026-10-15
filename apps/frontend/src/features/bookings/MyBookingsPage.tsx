import { CalendarOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Modal, Segmented, Tag, message } from 'antd'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import type { BookingStatus } from '../user/user.data'
import { useBookings, type BookingFilterType } from './hooks/useBookings'

const labels: Record<BookingStatus, string> = {
  confirmed: 'ĐÃ XÁC NHẬN',
  pending: 'CHỜ ĐẶT CỌC',
  completed: 'HOÀN TẤT',
  cancelled: 'ĐÃ HỦY',
}

export function MyBookingsPage() {
  const { filter, setFilter, visible, cancel } = useBookings()
  const [messageApi, contextHolder] = message.useMessage()

  const handleCancelConfirm = (id: string) =>
    Modal.confirm({
      title: 'Hủy lịch đặt sân?',
      content:
        'Lịch sẽ được chuyển sang trạng thái đã hủy. Chính sách hoàn tiền phụ thuộc vào thời điểm hủy.',
      okText: 'Xác nhận hủy',
      okButtonProps: { danger: true },
      cancelText: 'Giữ lịch',
      onOk: () => {
        cancel(id)
        messageApi.success('Đã hủy lịch đặt sân.')
      },
    })

  return (
    <section className="user-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">RESERVATION LOG</span>
          <h1>Lịch đặt sân của tôi</h1>
          <p>Quản lý trận sắp tới và xem lại lịch sử sử dụng sân.</p>
        </div>
        <Link to="/app/fields">
          <Button type="primary" icon={<PlusOutlined />}>
            Đặt sân mới
          </Button>
        </Link>
      </header>

      <Segmented
        block
        value={filter}
        onChange={(val) => setFilter(val as BookingFilterType)}
        options={[
          { value: 'upcoming', label: 'Sắp tới' },
          { value: 'pending', label: 'Chờ xử lý' },
          { value: 'history', label: 'Lịch sử' },
        ]}
      />

      {visible.length ? (
        <div className="booking-card-grid">
          {visible.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div className="booking-card__visual">
                <img src={booking.image} alt={booking.field} />
                <Tag>{labels[booking.status]}</Tag>
              </div>
              <div className="booking-card__body">
                <h2>{booking.field}</h2>
                <p>
                  <EnvironmentOutlined /> {booking.location}
                </p>
                <dl>
                  <div>
                    <dt>NGÀY & GIỜ</dt>
                    <dd>
                      <CalendarOutlined /> {booking.date}
                      <br />
                      {booking.time}
                    </dd>
                  </div>
                  <div>
                    <dt>TỔNG TIỀN</dt>
                    <dd className="lime">{formatPrice(booking.price)}</dd>
                  </div>
                </dl>
                <div>
                  <Button>Xem chi tiết</Button>
                  {booking.status === 'confirmed' && (
                    <Button danger onClick={() => handleCancelConfirm(booking.id)}>
                      Hủy lịch
                    </Button>
                  )}
                  {booking.status === 'pending' && (
                    <Button type="primary">Thanh toán cọc</Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty description="Không có lịch đặt sân trong mục này." />
      )}
    </section>
  )
}
