import {
  ClockCircleOutlined,
  DeleteOutlined,
  LockOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Spin,
  TimePicker,
  message,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import { useOwnerBlockedSlots } from '../hooks/useOwnerBlockedSlots'
import './OwnerBlockedSlotsModal.css'

export interface OwnerBlockedSlotsModalProps {
  open: boolean
  fieldId: string
  courtId: string
  courtName?: string
  onClose: () => void
}

interface BlockedSlotFormData {
  date: Dayjs
  timeRange: [Dayjs, Dayjs]
  reason?: string
}

export function OwnerBlockedSlotsModal({
  open,
  fieldId,
  courtId,
  courtName,
  onClose,
}: OwnerBlockedSlotsModalProps) {
  const { slots, loading, error, createBlockedSlot, deleteBlockedSlot, loadSlots } =
    useOwnerBlockedSlots(fieldId, courtId)

  const [form] = Form.useForm<BlockedSlotFormData>()
  const [submitting, setSubmitting] = useState(false)

  const handleCreateSlot = async (values: BlockedSlotFormData) => {
    try {
      setSubmitting(true)
      const blockedDate = values.date.format('YYYY-MM-DD')
      const startTime = values.timeRange[0].format('HH:mm')
      const endTime = values.timeRange[1].format('HH:mm')

      await createBlockedSlot({
        blockedDate,
        startTime,
        endTime,
        reason: values.reason?.trim() || undefined,
      })

      message.success('Đã khóa lịch sân con thành công!')
      form.resetFields()
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response
          ?.data?.error?.message ||
        (err instanceof Error ? err.message : 'Lỗi khi khóa lịch')

      if (errorMsg.includes('BLOCKED_SLOT_OVERLAP') || errorMsg.includes('chồng chéo')) {
        message.error('Khoảng thời gian này đã bị trùng lặp với lịch khóa khác. Vui lòng chọn giờ khác!')
      } else {
        message.error(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteBlockedSlot(slotId)
      message.success('Đã mở khóa khung giờ thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi mở khóa lịch'
      message.error(msg)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockOutlined style={{ color: 'var(--lime)' }} />
          <span>Quản lý khóa lịch (Blocked Slots) · {courtName || 'Sân con'}</span>
        </div>
      }
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      className="obsm-modal"
      width={600}
      destroyOnClose
    >
      <div className="obsm-container">
        {/* Form thêm mới khóa lịch */}
        <div style={{ background: 'var(--ground)', padding: 14, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
          <h4 style={{ color: 'var(--white)', margin: '0 0 12px 0', fontSize: 14 }}>
            + Thêm khung giờ khóa bảo trì / đóng sân
          </h4>
          <Form form={form} layout="vertical" onFinish={handleCreateSlot}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 12 }}>
              <Form.Item
                name="date"
                label="Ngày khóa"
                rules={[{ required: true, message: 'Chọn ngày' }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="timeRange"
                label="Khung giờ (Từ - Đến)"
                rules={[{ required: true, message: 'Chọn giờ' }]}
              >
                <TimePicker.RangePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <Form.Item name="reason" label="Lý do khóa">
              <Input placeholder="Ví dụ: Bảo trì thay cỏ định kỳ, vệ sinh sân..." />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={submitting}
              style={{ width: '100%' }}
            >
              Tạo khóa lịch
            </Button>
          </Form>
        </div>

        {/* Danh sách các khung giờ đang bị khóa */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sage)' }}>
              Danh sách khung giờ bị khóa ({slots.length})
            </span>
            <Button size="small" onClick={() => void loadSlots()}>
              Làm mới
            </Button>
          </div>

          {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 10 }} />}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin />
            </div>
          ) : slots.length > 0 ? (
            <div className="obsm-slots-list">
              {slots.map((slot) => (
                <div className="obsm-slot-item" key={slot.id}>
                  <div className="obsm-slot-info">
                    <span className="obsm-slot-time">
                      <ClockCircleOutlined />
                      {dayjs(slot.blockedDate).format('DD/MM/YYYY')}: {slot.startTime} – {slot.endTime}
                    </span>
                    <span className="obsm-slot-reason">{slot.reason || 'Bảo trì theo lịch'}</span>
                  </div>

                  <Popconfirm
                    title="Mở khóa khung giờ này?"
                    okText="Mở khóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDeleteSlot(slot.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      Mở khóa
                    </Button>
                  </Popconfirm>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="Không có khung giờ nào bị khóa." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </div>
    </Modal>
  )
}
