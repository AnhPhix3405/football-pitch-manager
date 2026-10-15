import { DeleteOutlined, EnvironmentOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, InputNumber, Select, TimePicker, Upload, message } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ownerFields } from './owner.data'
import { createField, deactivateField, updateField } from './service/owner.service'

interface FieldForm { name: string; address: string; format: string; surface: string; price: number; description: string; amenities: string[]; hours: [dayjs.Dayjs, dayjs.Dayjs] }
export function OwnerFieldFormPage() {
  const { fieldId } = useParams()
  const field = ownerFields.find((item) => item.id === fieldId)
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const submit = async (values: FieldForm) => {
    setSubmitting(true)
    try {
      if (fieldId && fieldId.length > 10) {
        await updateField(fieldId, {
          name: values.name,
          address: values.address,
          description: values.description,
          depositValue: values.price,
        })
        messageApi.success('Đã cập nhật thông tin sân.')
      } else {
        await createField({
          name: values.name,
          address: values.address,
          description: values.description,
          requireDeposit: true,
          depositType: 'fixed',
          depositValue: values.price,
        })
        messageApi.success('Đã tạo cụm sân mới thành công.')
      }
      setTimeout(() => navigate('/owner/fields'), 600)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : 'Lỗi khi lưu thông tin sân.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!fieldId) return
    try {
      await deactivateField(fieldId)
      messageApi.success('Đã ngưng hoạt động sân.')
      navigate('/owner/fields')
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : 'Không thể xóa sân.')
    }
  }

  return (
    <section className="owner-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">FACILITY CONFIGURATION</span>
          <h1>{field ? 'Chỉnh sửa sân' : 'Thêm sân mới'}</h1>
          <p>Thông tin chính xác giúp khách hàng đặt sân nhanh hơn.</p>
        </div>
      </header>
      <Form<FieldForm>
        className="owner-form"
        layout="vertical"
        onFinish={submit}
        initialValues={{
          name: field?.name,
          address: field?.address,
          format: field?.format ?? '5v5',
          surface: 'Cỏ nhân tạo',
          price: field?.price ?? 350000,
          description: 'Mặt sân chất lượng cao, hệ thống chiếu sáng đầy đủ.',
          amenities: ['Đèn LED', 'Bãi đỗ xe'],
          hours: [dayjs('06:00', 'HH:mm'), dayjs('23:00', 'HH:mm')],
        }}
      >
        <section>
          <h2>Thông tin cơ bản</h2>
          <Form.Item label="TÊN SÂN" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sân' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="ĐỊA CHỈ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>
          <div className="form-columns">
            <Form.Item label="LOẠI SÂN" name="format">
              <Select options={['5v5', '7v7', '11v11'].map((value) => ({ value, label: value }))} />
            </Form.Item>
            <Form.Item label="MẶT SÂN" name="surface">
              <Select options={['Cỏ nhân tạo', 'Cỏ tự nhiên'].map((value) => ({ value, label: value }))} />
            </Form.Item>
          </div>
          <Form.Item label="MÔ TẢ" name="description">
            <Input.TextArea rows={5} showCount maxLength={500} />
          </Form.Item>
        </section>
        <section>
          <h2>Giá & vận hành</h2>
          <Form.Item label="GIÁ CƠ BẢN / GIỜ" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
            <InputNumber min={100000} step={50000} addonAfter="VND" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="GIỜ MỞ CỬA" name="hours">
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="TIỆN ÍCH" name="amenities">
            <Checkbox.Group options={['Đèn LED', 'Bãi đỗ xe', 'Phòng thay đồ', 'Nước uống', 'Wi-Fi']} />
          </Form.Item>
          <Upload.Dragger beforeUpload={() => false} multiple>
            <UploadOutlined />
            <p>Tải ảnh sân lên đây</p>
          </Upload.Dragger>
        </section>
        <footer>
          <Button onClick={() => navigate('/owner/fields')}>Hủy</Button>
          {field && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Xóa sân
            </Button>
          )}
          <Button type="primary" htmlType="submit" loading={submitting} icon={<PlusOutlined />}>
            {field ? 'Lưu thay đổi' : 'Tạo sân'}
          </Button>
        </footer>
      </Form>
    </section>
  )
}
