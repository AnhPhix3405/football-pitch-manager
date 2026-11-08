import {
  ArrowLeftOutlined,
  BankOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  FileProtectOutlined,
  ReloadOutlined,
  ShopOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Result,
  Select,
  Spin,
  Steps,
  Tag,
  Upload,
  message,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { BrandMark } from '../../components/BrandMark'
import {
  getRegistrationStatus,
  registerOwner,
  type OwnerRegistrationStatusResponse,
} from './service/owner.service'

interface OwnerApplication {
  ownerName: string
  email: string
  phone: string
  businessName: string
  taxCode?: string
  bankAccount?: string
  address: string
  fieldCount: string
}

export function OwnerRegistrationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [form] = Form.useForm<OwnerApplication>()
  const [messageApi, contextHolder] = message.useMessage()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [statusData, setStatusData] = useState<OwnerRegistrationStatusResponse | null>(null)
  const [isReapplying, setIsReapplying] = useState(false)

  // Kiểm tra trạng thái hồ sơ hiện tại từ Backend
  const checkStatus = useCallback(async () => {
    if (!currentUser) {
      setLoadingStatus(false)
      return
    }
    try {
      setLoadingStatus(true)
      const res = await getRegistrationStatus()
      setStatusData(res)
    } catch {
      // User chưa có hồ sơ hoặc lỗi mạng, cho phép nhập form mới
      setStatusData(null)
    } finally {
      setLoadingStatus(false)
    }
  }, [currentUser])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Xử lý gửi hồ sơ thực tế lên backend qua POST /owner-registration
  const submit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await registerOwner({
        businessName: values.businessName,
        businessLicense: values.taxCode || `GPKD-${Date.now()}`,
        bankAccount: values.bankAccount || `BANK-DEFAULT-${values.ownerName}`,
        note: `Địa chỉ: ${values.address}, Quy mô: ${values.fieldCount} sân`,
      })
      messageApi.success(
        t('ownerOnboarding.statusPendingDesc', {
          defaultValue: 'Gửi hồ sơ đăng ký thành công! Đang chờ Quản trị viên xét duyệt.',
        }),
      )
      setIsReapplying(false)
      await checkStatus()
    } catch (reason: unknown) {
      messageApi.error(
        reason instanceof Error
          ? reason.message
          : 'Không thể gửi hồ sơ. Vui lòng kiểm tra lại thông tin.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Trường hợp chưa đăng nhập
  if (!currentUser) {
    return (
      <main className="owner-register">
        {contextHolder}
        <header>
          <BrandMark />
          <span>{t('ownerOnboarding.headerBadge', { defaultValue: 'FACILITY PARTNER ONBOARDING' })}</span>
        </header>
        <div className="owner-register__layout">
          <aside>
            <span className="eyebrow">{t('ownerOnboarding.eyebrow', { defaultValue: 'HỆ THỐNG ĐỐI TÁC CHỦ SÂN' })}</span>
            <h1>{t('ownerOnboarding.heroTitle', { defaultValue: 'Đưa sân bóng của bạn lên mạng lưới.' })}</h1>
            <p>{t('ownerOnboarding.heroDesc', { defaultValue: 'Quản lý lịch, giá và doanh thu trong một hệ thống điều hành duy nhất.' })}</p>
          </aside>
          <section className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <Result
              status="warning"
              title={t('ownerOnboarding.loginRequiredTitle', { defaultValue: 'Yêu cầu đăng nhập' })}
              subTitle={t('ownerOnboarding.loginRequiredDesc', {
                defaultValue: 'Bạn cần đăng nhập tài khoản trước khi đăng ký trở thành đối tác chủ sân.',
              })}
              extra={
                <Button type="primary" onClick={() => navigate('/auth/login')}>
                  {t('ownerOnboarding.btnLogin', { defaultValue: 'Đăng nhập ngay' })}
                </Button>
              }
            />
          </section>
        </div>
      </main>
    )
  }

  // Màn hình loading khi đang tải trạng thái
  if (loadingStatus) {
    return (
      <main className="owner-register flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Đang kiểm tra trạng thái hồ sơ..." />
      </main>
    )
  }

  // Trạng thái 1: Đã là chủ sân (Role = owner)
  if (statusData?.currentRole === 'owner') {
    return (
      <main className="owner-register">
        {contextHolder}
        <header>
          <BrandMark />
          <span>{t('ownerOnboarding.headerBadge', { defaultValue: 'FACILITY PARTNER ONBOARDING' })}</span>
        </header>
        <div className="owner-register__layout">
          <aside>
            <span className="eyebrow">{t('ownerOnboarding.eyebrow', { defaultValue: 'HỆ THỐNG ĐỐI TÁC CHỦ SÂN' })}</span>
            <h1>{t('ownerOnboarding.heroTitle', { defaultValue: 'Đưa sân bóng của bạn lên mạng lưới.' })}</h1>
            <p>{t('ownerOnboarding.heroDesc', { defaultValue: 'Quản lý lịch, giá và doanh thu trong một hệ thống điều hành duy nhất.' })}</p>
          </aside>
          <section className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <Result
              icon={<CheckCircleFilled style={{ color: '#8cfc70', fontSize: 64 }} />}
              title={t('ownerOnboarding.statusApprovedTitle', { defaultValue: 'Bạn đã là Đối tác Chủ sân' })}
              subTitle={t('ownerOnboarding.statusApprovedDesc', {
                defaultValue:
                  'Tài khoản của bạn đã được phê duyệt tư cách Chủ sân. Bạn có toàn quyền truy cập Cổng Quản Lý Chủ Sân để quản lý sân bóng, lịch đặt và doanh thu.',
              })}
              extra={[
                <Button key="owner" type="primary" onClick={() => navigate('/owner')}>
                  {t('ownerOnboarding.btnGoOwner', { defaultValue: 'Truy cập Cổng Chủ Sân' })}
                </Button>,
                <Button key="home" onClick={() => navigate('/')}>
                  {t('ownerOnboarding.btnGoHome', { defaultValue: 'Về Trang Chủ' })}
                </Button>,
              ]}
            />
          </section>
        </div>
      </main>
    )
  }

  // Trạng thái 2: Đang chờ duyệt (Pending)
  const isPending =
    statusData?.hasPendingRequest || statusData?.latestRequest?.status === 'pending'
  if (isPending && !isReapplying) {
    return (
      <main className="owner-register">
        {contextHolder}
        <header>
          <BrandMark />
          <span>{t('ownerOnboarding.headerBadge', { defaultValue: 'FACILITY PARTNER ONBOARDING' })}</span>
        </header>
        <div className="owner-register__layout">
          <aside>
            <span className="eyebrow">{t('ownerOnboarding.eyebrow', { defaultValue: 'HỆ THỐNG ĐỐI TÁC CHỦ SÂN' })}</span>
            <h1>{t('ownerOnboarding.heroTitle', { defaultValue: 'Đưa sân bóng của bạn lên mạng lưới.' })}</h1>
            <p>{t('ownerOnboarding.heroDesc', { defaultValue: 'Quản lý lịch, giá và doanh thu trong một hệ thống điều hành duy nhất.' })}</p>
            <ul>
              <li>
                <ShopOutlined /> {t('ownerOnboarding.benefit1', { defaultValue: 'Tiếp cận cộng đồng cầu thủ đông đảo' })}
              </li>
              <li>
                <BankOutlined /> {t('ownerOnboarding.benefit2', { defaultValue: 'Theo dõi doanh thu & lịch đặt minh bạch' })}
              </li>
              <li>
                <FileProtectOutlined /> {t('ownerOnboarding.benefit3', { defaultValue: 'Xác minh và bảo vệ giao dịch trực tuyến' })}
              </li>
            </ul>
          </aside>
          <section className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="text-center py-4">
              <ClockCircleOutlined style={{ color: '#fbbf24', fontSize: 56 }} />
              <h2 className="text-xl font-bold text-white mt-4">
                {t('ownerOnboarding.statusPendingTitle', { defaultValue: 'Hồ sơ đang chờ xét duyệt' })}
              </h2>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mt-2">
                {t('ownerOnboarding.statusPendingDesc', {
                  defaultValue:
                    'Hồ sơ đăng ký đối tác chủ sân của bạn đã được gửi thành công và đang được Quản trị viên thẩm định. Bạn sẽ nhận được thông báo ngay khi hồ sơ có kết quả phê duyệt.',
                })}
              </p>
            </div>

            {statusData?.profile && (
              <Card
                size="small"
                title={<span className="text-zinc-300 font-semibold text-xs uppercase tracking-wider">Thông tin hồ sơ đã nộp</span>}
                className="bg-white/[0.02] border-white/10"
              >
                <Descriptions column={1} size="small" className="text-zinc-300">
                  <Descriptions.Item label="Tên cụm sân / Doanh nghiệp">
                    <span className="font-semibold text-white">{statusData.profile.businessName}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã số thuế / GPKD">
                    <span className="text-zinc-300">{statusData.profile.businessLicense}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tài khoản ngân hàng">
                    <span className="text-zinc-300">{statusData.profile.bankAccount}</span>
                  </Descriptions.Item>
                  {statusData.latestRequest?.createdAt && (
                    <Descriptions.Item label="Thời gian gửi">
                      <span className="text-zinc-400">
                        {new Date(statusData.latestRequest.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Trạng thái">
                    <Tag color="warning">ĐANG CHỜ DUYỆT</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button onClick={() => navigate('/')}>
                {t('ownerOnboarding.btnGoHome', { defaultValue: 'Về Trang Chủ' })}
              </Button>
              <Button type="primary" icon={<ReloadOutlined />} onClick={checkStatus}>
                {t('ownerOnboarding.btnRefresh', { defaultValue: 'Kiểm tra lại trạng thái' })}
              </Button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  // Trạng thái 3: Bị từ chối (Rejected)
  const isRejected = statusData?.latestRequest?.status === 'rejected'
  if (isRejected && !isReapplying) {
    return (
      <main className="owner-register">
        {contextHolder}
        <header>
          <BrandMark />
          <span>{t('ownerOnboarding.headerBadge', { defaultValue: 'FACILITY PARTNER ONBOARDING' })}</span>
        </header>
        <div className="owner-register__layout">
          <aside>
            <span className="eyebrow">{t('ownerOnboarding.eyebrow', { defaultValue: 'HỆ THỐNG ĐỐI TÁC CHỦ SÂN' })}</span>
            <h1>{t('ownerOnboarding.heroTitle', { defaultValue: 'Đưa sân bóng của bạn lên mạng lưới.' })}</h1>
            <p>{t('ownerOnboarding.heroDesc', { defaultValue: 'Quản lý lịch, giá và doanh thu trong một hệ thống điều hành duy nhất.' })}</p>
          </aside>
          <section className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="text-center py-4">
              <CloseCircleFilled style={{ color: '#f87171', fontSize: 56 }} />
              <h2 className="text-xl font-bold text-white mt-4">
                {t('ownerOnboarding.statusRejectedTitle', { defaultValue: 'Hồ sơ chưa được phê duyệt' })}
              </h2>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mt-2">
                {t('ownerOnboarding.statusRejectedDesc', {
                  defaultValue: 'Hồ sơ đăng ký đối tác chủ sân chưa đáp ứng tiêu chuẩn thẩm định của hệ thống.',
                })}
              </p>
            </div>

            {statusData?.latestRequest?.note && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <span className="font-semibold block mb-1">
                  {t('ownerOnboarding.rejectionReason', { defaultValue: 'Lý do từ chối' })}:
                </span>
                <span>{statusData.latestRequest.note}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button onClick={() => navigate('/')}>
                {t('ownerOnboarding.btnGoHome', { defaultValue: 'Về Trang Chủ' })}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setIsReapplying(true)
                  setStep(0)
                  form.setFieldsValue({
                    businessName: statusData?.profile?.businessName || '',
                    taxCode: statusData?.profile?.businessLicense || '',
                    bankAccount: statusData?.profile?.bankAccount || '',
                  })
                }}
              >
                {t('ownerOnboarding.btnReapply', { defaultValue: 'Nộp lại hồ sơ' })}
              </Button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  // Trạng thái 4: Hiển thị Form đăng ký (Chưa gửi hoặc đang nộp lại)
  return (
    <main className="owner-register">
      <header>
        <BrandMark />
        <span>{t('ownerOnboarding.headerBadge', { defaultValue: 'FACILITY PARTNER ONBOARDING' })}</span>
      </header>
      {contextHolder}
      <div className="owner-register__layout">
        <aside>
          <span className="eyebrow">{t('ownerOnboarding.eyebrow', { defaultValue: 'HỆ THỐNG ĐỐI TÁC CHỦ SÂN' })}</span>
          <h1>{t('ownerOnboarding.heroTitle', { defaultValue: 'Đưa sân bóng của bạn lên mạng lưới.' })}</h1>
          <p>{t('ownerOnboarding.heroDesc', { defaultValue: 'Quản lý lịch, giá và doanh thu trong một hệ thống điều hành duy nhất.' })}</p>
          <ul>
            <li>
              <ShopOutlined /> {t('ownerOnboarding.benefit1', { defaultValue: 'Tiếp cận cộng đồng cầu thủ đông đảo' })}
            </li>
            <li>
              <BankOutlined /> {t('ownerOnboarding.benefit2', { defaultValue: 'Theo dõi doanh thu & lịch đặt minh bạch' })}
            </li>
            <li>
              <FileProtectOutlined /> {t('ownerOnboarding.benefit3', { defaultValue: 'Xác minh và bảo vệ giao dịch trực tuyến' })}
            </li>
          </ul>
        </aside>

        <section className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
          <Steps
            current={step}
            items={[
              { title: t('ownerOnboarding.stepOwner', { defaultValue: 'Chủ sân' }) },
              { title: t('ownerOnboarding.stepFacility', { defaultValue: 'Cơ sở' }) },
              { title: t('ownerOnboarding.stepComplete', { defaultValue: 'Xét duyệt' }) },
            ]}
          />

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              ownerName: currentUser.name || '',
              email: currentUser.email || '',
              fieldCount: '1',
            }}
          >
            {/* Step 0: Thông tin chủ sân */}
            <div hidden={step !== 0}>
              <h2 className="text-lg font-bold text-white mb-4">
                {t('ownerOnboarding.ownerInfoTitle', { defaultValue: 'Thông tin chủ sân' })}
              </h2>
              <Form.Item
                label={t('ownerOnboarding.ownerName', { defaultValue: 'HỌ VÀ TÊN' })}
                name="ownerName"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item
                label={t('ownerOnboarding.email', { defaultValue: 'EMAIL' })}
                name="email"
                rules={[{ required: true }, { type: 'email', message: 'Email không hợp lệ.' }]}
              >
                <Input placeholder="owner@example.com" />
              </Form.Item>
              <Form.Item
                label={t('ownerOnboarding.phone', { defaultValue: 'SỐ ĐIỆN THOẠI' })}
                name="phone"
                rules={[
                  { required: true, pattern: /^0\d{9}$/, message: 'Số điện thoại cần gồm 10 chữ số.' },
                ]}
              >
                <Input placeholder="0901234567" />
              </Form.Item>
            </div>

            {/* Step 1: Thông tin cơ sở & pháp nhân */}
            <div hidden={step !== 1}>
              <h2 className="text-lg font-bold text-white mb-4">
                {t('ownerOnboarding.facilityInfoTitle', { defaultValue: 'Thông tin cơ sở & pháp nhân' })}
              </h2>
              <Form.Item
                label={t('ownerOnboarding.businessName', { defaultValue: 'TÊN DOANH NGHIỆP / CỤM SÂN' })}
                name="businessName"
                rules={[{ required: true, message: 'Vui lòng nhập tên cụm sân hoặc doanh nghiệp.' }]}
              >
                <Input placeholder="Sân bóng đá Chuyên Nghiệp" />
              </Form.Item>
              <Form.Item
                label={t('ownerOnboarding.address', { defaultValue: 'ĐỊA CHỈ' })}
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụm sân.' }]}
              >
                <Input placeholder="123 Đường Số 1, Quận Bình Thạnh, TP.HCM" />
              </Form.Item>
              <Form.Item
                label={t('ownerOnboarding.fieldCount', { defaultValue: 'SỐ LƯỢNG SÂN' })}
                name="fieldCount"
              >
                <Select
                  options={['1', '2-5', '6-10', 'Trên 10'].map((value) => ({
                    value,
                    label: `${value} sân`,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label={t('ownerOnboarding.taxCode', { defaultValue: 'MÃ SỐ THUẾ / GPKD' })}
                name="taxCode"
              >
                <Input placeholder="0312345678" />
              </Form.Item>
              <Form.Item label="SỐ TÀI KHOẢN NGÂN HÀNG (NHẬN DOANH THU)" name="bankAccount">
                <Input placeholder="1903... Techcombank - NGUYEN VAN A" />
              </Form.Item>
              <Upload
                beforeUpload={() => {
                  messageApi.info('Tệp giấy phép đã được tiếp nhận.')
                  return false
                }}
              >
                <Button icon={<UploadOutlined />}>
                  {t('ownerOnboarding.uploadLicense', { defaultValue: 'Tải giấy phép kinh doanh' })}
                </Button>
              </Upload>
            </div>

            <div className="owner-register__actions flex items-center justify-between mt-6">
              {step > 0 ? (
                <Button icon={<ArrowLeftOutlined />} onClick={() => setStep(step - 1)}>
                  {t('ownerOnboarding.btnBack', { defaultValue: 'Quay lại' })}
                </Button>
              ) : (
                <div />
              )}
              <Button
                type="primary"
                loading={submitting}
                onClick={() =>
                  step === 0
                    ? form.validateFields(['ownerName', 'email', 'phone']).then(() => setStep(1))
                    : submit()
                }
              >
                {step === 0
                  ? t('ownerOnboarding.btnNext', { defaultValue: 'Tiếp tục' })
                  : t('ownerOnboarding.btnSubmit', { defaultValue: 'Gửi hồ sơ đăng ký' })}
              </Button>
            </div>
          </Form>
        </section>
      </div>
    </main>
  )
}
