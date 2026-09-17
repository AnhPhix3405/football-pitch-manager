import { BankOutlined, CheckCircleFilled, FileProtectOutlined, ShopOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Form, Input, Result, Select, Steps, Upload, message } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import { BrandMark } from '../../common/BrandMark'
import { signedIn } from '../auth/auth.slice'

interface OwnerApplication { ownerName: string; email: string; phone: string; businessName: string; taxCode?: string; address: string; fieldCount: string }
export function OwnerRegistrationPage() {
  const [step, setStep] = useState(0)
  const [application, setApplication] = useState<OwnerApplication>()
  const [form] = Form.useForm<OwnerApplication>()
  const [messageApi, contextHolder] = message.useMessage()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const submit = async () => { const values = await form.validateFields(); setApplication(values); setStep(2) }
  const enterPortal = () => {
    if (!application) {
      messageApi.error('Không tìm thấy dữ liệu hồ sơ. Vui lòng quay lại và gửi lại.')
      setStep(1)
      return
    }
    dispatch(signedIn({ id: crypto.randomUUID(), name: application.ownerName, email: application.email, role: 'owner' }))
    navigate('/owner')
  }
  return <main className="owner-register"><header><BrandMark /><span>FACILITY PARTNER ONBOARDING</span></header>{contextHolder}<div className="owner-register__layout"><aside><span className="eyebrow">OWNER NODE</span><h1>Đưa sân bóng của bạn lên mạng lưới.</h1><p>Quản lý lịch, giá và doanh thu trong một hệ thống điều hành duy nhất.</p><ul><li><ShopOutlined /> Tiếp cận cộng đồng cầu thủ</li><li><BankOutlined /> Theo dõi doanh thu minh bạch</li><li><FileProtectOutlined /> Xác minh và bảo vệ giao dịch</li></ul></aside><section><Steps current={step} items={[{ title: 'Chủ sân' }, { title: 'Cơ sở' }, { title: 'Hoàn tất' }]} />{step < 2 ? <Form form={form} layout="vertical" requiredMark={false} initialValues={{ fieldCount: '1' }}><div hidden={step !== 0}><h2>Thông tin chủ sân</h2><Form.Item label="HỌ VÀ TÊN" name="ownerName" rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}><Input /></Form.Item><Form.Item label="EMAIL" name="email" rules={[{ required: true }, { type: 'email', message: 'Email không hợp lệ.' }]}><Input /></Form.Item><Form.Item label="SỐ ĐIỆN THOẠI" name="phone" rules={[{ required: true, pattern: /^0\d{9}$/, message: 'Số điện thoại cần gồm 10 chữ số.' }]}><Input /></Form.Item></div><div hidden={step !== 1}><h2>Thông tin cơ sở</h2><Form.Item label="TÊN DOANH NGHIỆP / CỤM SÂN" name="businessName" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="ĐỊA CHỈ" name="address" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="SỐ LƯỢNG SÂN" name="fieldCount"><Select options={['1', '2-5', '6-10', 'Trên 10'].map((value) => ({ value, label: value }))} /></Form.Item><Form.Item label="MÃ SỐ THUẾ (TÙY CHỌN)" name="taxCode"><Input /></Form.Item><Upload beforeUpload={() => { messageApi.info('Tệp đã được giữ cục bộ cho bản demo.'); return false }}><Button icon={<UploadOutlined />}>Tải giấy phép kinh doanh</Button></Upload></div><div className="owner-register__actions">{step > 0 && <Button onClick={() => setStep(step - 1)}>Quay lại</Button>}<Button type="primary" onClick={() => step === 0 ? form.validateFields(['ownerName', 'email', 'phone']).then(() => setStep(1)) : submit()}>{step === 0 ? 'Tiếp tục' : 'Gửi hồ sơ'}</Button></div></Form> : <Result icon={<CheckCircleFilled style={{ color: '#8cfc70' }} />} title="Hồ sơ đã được tiếp nhận" subTitle="Ở môi trường thật, quản trị viên sẽ xác minh hồ sơ. Bản demo cho phép truy cập portal ngay." extra={<Button type="primary" onClick={enterPortal}>Vào portal chủ sân</Button>} />}</section></div></main>
}
