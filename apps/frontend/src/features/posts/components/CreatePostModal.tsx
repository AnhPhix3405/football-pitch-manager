import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, TimePicker, message } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPost } from '../service/post.service'
import type { CreatePostPayload } from '../interface/post.types'

interface CreatePostFormValues {
  title: string
  content?: string
  playDate: dayjs.Dayjs
  timeRange: [dayjs.Dayjs, dayjs.Dayjs]
  skillLevelRequired: string
  maxPlayers: number
  location?: string
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

  const handleFinish = async (values: CreatePostFormValues) => {
    try {
      setLoading(true)
      const payload: CreatePostPayload = {
        title: values.title.trim(),
        content: values.content
          ? `${values.content.trim()}${values.location ? ` (Địa điểm: ${values.location.trim()})` : ''}`
          : values.location
            ? `Địa điểm: ${values.location.trim()}`
            : undefined,
        playDate: values.playDate.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        skillLevelRequired: values.skillLevelRequired,
        maxPlayers: values.maxPlayers,
      }

      await createPost(payload)
      messageApi.success(t('posts.createModal.success', { defaultValue: 'Đăng bài tìm đối thành công!' }))
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
        title={t('posts.createModal.title', { defaultValue: 'Đăng yêu cầu tìm đối thủ / Ghép trận' })}
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        centered
        width={560}
      >
        <Form<CreatePostFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            skillLevelRequired: 'Trung bình khá',
            maxPlayers: 14,
            playDate: dayjs().add(1, 'day'),
            timeRange: [dayjs().hour(19).minute(0), dayjs().hour(20).minute(30)],
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label={t('posts.createModal.postTitle', { defaultValue: 'TIÊU ĐỀ BÀI ĐĂNG' })}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài đăng.' }]}
          >
            <Input placeholder="Ví dụ: Tìm kèo giao lưu 7v7 tối thứ 6 sân Tân Bình" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label={t('booking.flow.matchDate', { defaultValue: 'NGÀY ĐÁ' })}
              name="playDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày.' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" minDate={dayjs()} />
            </Form.Item>

            <Form.Item
              label={t('booking.flow.chooseTimeSlot', { defaultValue: 'KHUNG GIỜ' })}
              name="timeRange"
              rules={[{ required: true, message: 'Vui lòng chọn khung giờ.' }]}
            >
              <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label={t('posts.skillLevel', { defaultValue: 'TRÌNH ĐỘ YÊU CẦU' })} name="skillLevelRequired">
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

          <Form.Item label={t('posts.createModal.description', { defaultValue: 'GHI CHÚ / ĐIỀU LỆ TRẬN ĐẤU' })} name="content">
            <Input.TextArea
              rows={3}
              placeholder="Chia tiền sân 5-5, chuẩn bị bóng thi đấu, đá văn minh không va chạm thô bạo..."
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={onClose}>{t('common.cancel', { defaultValue: 'Hủy' })}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('posts.createModal.submit', { defaultValue: 'Đăng yêu cầu ngay' })}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}
