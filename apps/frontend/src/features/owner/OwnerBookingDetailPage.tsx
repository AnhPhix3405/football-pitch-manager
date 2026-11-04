import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarCircleOutlined,
  PhoneOutlined,
  RollbackOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Descriptions, Input, Modal, Result, Tag, Typography, message } from 'antd'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { ownerBookings } from './owner.data'
import { usePayment } from '../payment/hooks/usePayment'

const { Text } = Typography

export function OwnerBookingDetailPage() {
  const { bookingId = '' } = useParams()
  const booking = ownerBookings.find((item) => item.id === bookingId)
  const [status, setStatus] = useState(booking?.status)
  const [deposit, setDeposit] = useState(booking?.deposit ?? 0)
  const [notes, setNotes] = useState(booking?.notes ?? '')
  const [messageApi, contextHolder] = message.useMessage()
  const { loading: paymentLoading, handleConfirmCash, handleRefund } = usePayment()
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundReason, setRefundReason] = useState('')

  if (!booking) {
    return (
      <Result
        status="404"
        title="Không tìm thấy booking"
        extra={
          <Link to="/owner/bookings">
            <Button>Quay lại danh sách</Button>
          </Link>
        }
      />
    )
  }

  const change = (next: 'confirmed' | 'cancelled') =>
    Modal.confirm({
      title: next === 'confirmed' ? 'Xác nhận booking này?' : 'Từ chối booking này?',
      content: 'Khách hàng sẽ nhận được thông báo về thay đổi trạng thái.',
      onOk: () => {
        setStatus(next)
        messageApi.success('Đã cập nhật trạng thái booking.')
      },
    })

  const onConfirmCash = async () => {
    Modal.confirm({
      title: 'Xác nhận đã nhận tiền mặt?',
      content: `Xác nhận khách hàng đã thanh toán số tiền còn lại hoặc toàn bộ đơn ${formatPrice(booking.amount - deposit)}?`,
      okText: 'Xác nhận thu tiền',
      onOk: async () => {
        const tx = await handleConfirmCash(booking.id, {
          amount: booking.amount - deposit,
          notes: 'Thu tiền mặt tại sân',
        })
        if (tx) {
          setDeposit(booking.amount)
          messageApi.success('Đã xác nhận thanh toán tiền mặt thành công!')
        }
      },
    })
  }

  const onProcessRefund = async () => {
    if (!refundReason.trim()) {
      messageApi.error('Vui lòng nhập lý do hoàn tiền cọc.')
      return
    }
    const res = await handleRefund(booking.id, {
      amount: deposit,
      reason: refundReason,
    })
    if (res) {
      setDeposit(0)
      setRefundModalOpen(false)
      messageApi.success('Đã xử lý hoàn tiền cọc thành công!')
    }
  }

  return (
    <section className="owner-page">
      {contextHolder}
      <Link className="back-link" to="/owner/bookings">
        ← Trở lại danh sách
      </Link>
      <header className="user-page__head">
        <div>
          <span className="eyebrow">BOOKING {booking.id}</span>
          <h1>{booking.field}</h1>
          <p>
            <CalendarOutlined /> {booking.date} · {booking.time}
          </p>
        </div>
        <Tag color={status === 'confirmed' ? 'green' : status === 'cancelled' ? 'red' : 'gold'}>
          {status?.toUpperCase()}
        </Tag>
      </header>

      <div className="owner-detail-grid">
        <section className="owner-panel">
          <h2>Thông tin khách hàng</h2>
          <Descriptions
            column={1}
            items={[
              { key: 'name', label: <><UserOutlined /> Khách hàng</>, children: booking.customer },
              { key: 'phone', label: <><PhoneOutlined /> Điện thoại</>, children: booking.phone },
              { key: 'field', label: 'Sân', children: booking.field },
            ]}
          />
          <h2>Ghi chú vận hành</h2>
          <Input.TextArea
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <Button style={{ marginTop: 12 }} onClick={() => messageApi.success('Đã lưu ghi chú.')}>
            Lưu ghi chú
          </Button>
        </section>

        <aside className="owner-panel payment-panel">
          <span className="eyebrow">PAYMENT STATUS</span>
          <dl>
            <div>
              <dt>Tổng booking</dt>
              <dd>{formatPrice(booking.amount)}</dd>
            </div>
            <div>
              <dt>Đã thanh toán / cọc</dt>
              <dd className="lime">{formatPrice(deposit)}</dd>
            </div>
            <div>
              <dt>Còn lại</dt>
              <dd>{formatPrice(Math.max(0, booking.amount - deposit))}</dd>
            </div>
          </dl>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {booking.amount > deposit && (
              <Button
                type="default"
                icon={<DollarCircleOutlined style={{ color: '#8cfc70' }} />}
                loading={paymentLoading}
                block
                onClick={onConfirmCash}
              >
                Xác nhận thu tiền mặt
              </Button>
            )}

            {deposit > 0 && (status === 'cancelled' || status === 'pending') && (
              <Button
                danger
                icon={<RollbackOutlined />}
                loading={paymentLoading}
                block
                onClick={() => setRefundModalOpen(true)}
              >
                Hoàn tiền cọc
              </Button>
            )}

            {status === 'pending' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  block
                  onClick={() => change('confirmed')}
                >
                  Xác nhận booking
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  block
                  onClick={() => change('cancelled')}
                >
                  Từ chối
                </Button>
              </>
            )}
          </div>
        </aside>
      </div>

      <Modal
        open={refundModalOpen}
        title="Hoàn tiền cọc cho khách hàng"
        onCancel={() => setRefundModalOpen(false)}
        onOk={onProcessRefund}
        okText="Xác nhận hoàn tiền"
        okButtonProps={{ danger: true, loading: paymentLoading }}
        cancelText="Hủy bỏ"
      >
        <div style={{ padding: '12px 0' }}>
          <p>
            Số tiền hoàn: <strong style={{ color: '#ef4444' }}>{formatPrice(deposit)}</strong>
          </p>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>
            Lý do hoàn tiền:
          </Text>
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: Khách hủy sớm hợp lệ, thời tiết mưa bão sân ngập nước..."
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </div>
      </Modal>
    </section>
  )
}
