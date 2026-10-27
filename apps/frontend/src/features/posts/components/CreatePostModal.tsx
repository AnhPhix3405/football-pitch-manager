import { ClockCircleOutlined } from '@ant-design/icons'
import { DatePicker, Form, Input, InputNumber, Modal, Radio, Select, message } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PillButton } from '../../../components/PillButton'
import { createPost } from '../service/post.service'
import type { CreatePostPayload } from '../interface/post.types'

const MORNING_SLOTS = [
  '06:00 - 07:30',
  '07:30 - 09:00',
  '09:00 - 10:30',
]

const AFTERNOON_EVENING_SLOTS = [
  '16:00 - 17:30',
  '17:30 - 19:00',
  '19:00 - 20:30',
  '20:30 - 22:00',
  '22:00 - 23:30',
]

interface CreatePostFormValues {
  title: string
  content?: string
  playDate: dayjs.Dayjs
  timeSlot: string
  skillLevelRequired: string
  maxPlayers: number
  location?: string
}

interface SlotSelectorProps {
  value?: string
  onChange?: (value: string) => void
  selectedDate?: dayjs.Dayjs
}

function SlotSelector({ value, onChange, selectedDate }: SlotSelectorProps) {
  const { t } = useTranslation()

  const isSlotExpired = (slot: string) => {
    if (!selectedDate || !dayjs().isSame(selectedDate, 'day')) {
      return false
    }
    const [start] = slot.split(' - ')
    const [hours, minutes] = start.split(':').map(Number)
    const slotStartTime = dayjs().hour(hours).minute(minutes).second(0)
    return dayjs().isAfter(slotStartTime)
  }

  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div>
        <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>
          {t('posts.createModal.morningSlots')}
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {MORNING_SLOTS.map((time) => (
            <Radio.Button
              key={time}
              value={time}
              disabled={isSlotExpired(time)}
              style={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 6,
                textAlign: 'center',
              }}
            >
              <ClockCircleOutlined />
              <span>{time}</span>
            </Radio.Button>
          ))}
        </div>
      </div>

      <div>
        <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>
          {t('posts.createModal.afternoonEveningSlots')}
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {AFTERNOON_EVENING_SLOTS.map((time) => (
            <Radio.Button
              key={time}
              value={time}
              disabled={isSlotExpired(time)}
              style={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 6,
                textAlign: 'center',
              }}
            >
              <ClockCircleOutlined />
              <span>{time}</span>
            </Radio.Button>
          ))}
        </div>
      </div>
    </Radio.Group>
  )
}

export function CreatePostModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const [form] = Form.useForm<CreatePostFormValues>()
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const selectedDate = Form.useWatch('playDate', form)

  const handleFinish = async (values: CreatePostFormValues) => {
    try {
      setLoading(true)
      const [startTime, endTime] = values.timeSlot.split(' - ')
      const payload: CreatePostPayload = {
        title: values.title.trim(),
        content: values.content
          ? `${values.content.trim()}${values.location ? ` (Địa điểm: ${values.location.trim()})` : ''}`
          : values.location
            ? `Địa điểm: ${values.location.trim()}`
            : undefined,
        playDate: values.playDate.format('YYYY-MM-DD'),
        startTime: startTime.trim(),
        endTime: endTime?.trim() || undefined,
        skillLevelRequired: values.skillLevelRequired,
        maxPlayers: values.maxPlayers,
      }

      await createPost(payload)
      messageApi.success(t('posts.createModal.success'))
      form.resetFields()
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 500)
    } catch (err: unknown) {
      messageApi.error(err instanceof Error ? err.message : 'Không thể tạo bài đăng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={t('posts.createModal.title')}
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        centered
        width={620}
      >
        <Form<CreatePostFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            skillLevelRequired: 'Trung bình khá',
            maxPlayers: 14,
            playDate: dayjs().add(1, 'day'),
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label={t('posts.createModal.postTitle')}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài đăng.' }]}
          >
            <Input placeholder="Ví dụ: Tìm kèo giao lưu 7v7 tối thứ 6 sân Tân Bình" />
          </Form.Item>

          <Form.Item
            label={t('booking.flow.matchDate')}
            name="playDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày.' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" minDate={dayjs()} />
          </Form.Item>

          <Form.Item
            label={t('posts.createModal.slotLabel')}
            name="timeSlot"
            rules={[{ required: true, message: t('posts.createModal.slotRequired') }]}
          >
            <SlotSelector selectedDate={selectedDate} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label={t('posts.skillLevel')} name="skillLevelRequired">
              <Select
                options={[
                  { value: 'Phong trào', label: 'Phong trào (Vui là chính)' },
                  { value: 'Trung bình khá', label: 'Trung bình khá' },
                  { value: 'Khá', label: 'Khá' },
                  { value: 'Bán chuyên', label: 'Bán chuyên' },
                ]}
              />
            </Form.Item>

            <Form.Item label="SỐ NGƯỜI ĐÁ (QUY MÔ)" name="maxPlayers">
              <InputNumber style={{ width: '100%' }} min={2} max={30} addonAfter="cầu thủ" />
            </Form.Item>
          </div>

          <Form.Item label="ĐỊA ĐIỂM / TÊN SÂN BÓNG" name="location">
            <Input placeholder="Ví dụ: Sân Chánh Hưng, Quận 8, TP.HCM" />
          </Form.Item>

          <Form.Item label={t('posts.createModal.description')} name="content">
            <Input.TextArea
              rows={3}
              placeholder="Chia tiền sân 5-5, chuẩn bị bóng thi đấu, đá văn minh không va chạm thô bạo..."
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <PillButton variant="secondary" onClick={onClose} text={t('common.cancel')} />
            <PillButton
              variant="primary"
              type="submit"
              loading={loading}
              text={t('posts.createModal.submit')}
            />
          </div>
        </Form>
      </Modal>
    </>
  )
}
