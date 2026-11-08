import { useTranslation } from 'react-i18next'
import {
  AimOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
  PictureOutlined,
  CheckCircleFilled,
  CompassOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { Form, Input, InputNumber, Segmented, Switch, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ownerFields } from './owner.data'
import './OwnerFieldFormPage.css'
import {
  createField,
  getOwnerFieldDetail,
  updateField,
  type CreateFieldPayload,
} from './service/owner.service'

interface FieldFormData {
  name: string
  description?: string
  address: string
  district?: string
  lat?: number
  lng?: number
  requireDeposit: boolean
  depositType: 'fixed' | 'percentage'
  depositValue?: number
}

export function OwnerFieldFormPage() {
  const { fieldId } = useParams()
  const isEditing = Boolean(fieldId && fieldId.length > 5)
  const navigate = useNavigate()
  const [form] = Form.useForm<FieldFormData>()
  const [messageApi, contextHolder] = message.useMessage()
  const { t } = useTranslation()
  const [satellite, setSatellite] = useState(false)
  const mapPreview = useRef<HTMLDivElement>(null)
  const [submitting, setSubmitting] = useState(false)

  // Watch form fields for live preview updates
  const watchedName = Form.useWatch('name', form) || ''
  const watchedDesc = Form.useWatch('description', form) || ''
  const watchedLat = Form.useWatch('lat', form) ?? 10.798123
  const watchedLng = Form.useWatch('lng', form) ?? 106.654321
  const watchedRequireDeposit = Form.useWatch('requireDeposit', form) ?? false
  const watchedDepositType = Form.useWatch('depositType', form) || 'fixed'
  const watchedDepositValue = Form.useWatch('depositValue', form) ?? 100000

  // Load existing data if editing
  useEffect(() => {
    if (!isEditing || !fieldId) return

    const loadData = async () => {
      try {
        const detail = await getOwnerFieldDetail(fieldId)
        if (detail) {
          form.setFieldsValue({
            name: detail.name,
            description: detail.description || '',
            address: detail.address,
            district: detail.district || '',
            lat: detail.lat ? Number(detail.lat) : 10.798123,
            lng: detail.lng ? Number(detail.lng) : 106.654321,
            requireDeposit: detail.requireDeposit ?? true,
            depositType: (detail.depositType as 'fixed' | 'percentage') || 'fixed',
            depositValue: detail.depositValue ? Number(detail.depositValue) : 100000,
          })
          return
        }
      } catch {
        // Fallback to local mock data if api detail fails
      }

      const localField = ownerFields.find((f) => f.id === fieldId)
      if (localField) {
        form.setFieldsValue({
          name: localField.name,
          address: localField.address,
          description: '',
          district: 'Tân Bình',
          lat: 10.798123,
          lng: 106.654321,
          requireDeposit: true,
          depositType: 'fixed',
          depositValue: localField.price || 100000,
        })
      }
    }

    loadData()
  }, [fieldId, form, isEditing])

  // Get current device geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      messageApi.warning('Trình duyệt không hỗ trợ xác định vị trí GPS.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLat = Number(pos.coords.latitude.toFixed(6))
        const currentLng = Number(pos.coords.longitude.toFixed(6))
        form.setFieldsValue({
          lat: currentLat,
          lng: currentLng,
        })
        messageApi.success('Đã cập nhật tọa độ vị trí hiện tại!')
      },
      () => {
        messageApi.error('Không thể truy cập quyền vị trí GPS của thiết bị.')
      },
    )
  }

  // Quick preset button click handler
  const handleSelectPreset = (value: number, type: 'fixed' | 'percentage') => {
    form.setFieldsValue({
      depositType: type,
      depositValue: value,
    })
  }

  // Save draft locally
  const handleSaveDraft = () => {
    const values = form.getFieldsValue()
    localStorage.setItem('owner_field_draft', JSON.stringify(values))
    messageApi.success('Đã lưu bản nháp thành công vào bộ nhớ trình duyệt!')
  }

  // Form submission
  const handleSubmit = async (values: FieldFormData) => {
    setSubmitting(true)
    try {
      const payload: CreateFieldPayload = {
        name: values.name.trim(),
        address: values.address.trim(),
        district: values.district?.trim() || undefined,
        description: values.description?.trim() || undefined,
        lat: values.lat !== undefined ? Number(values.lat) : undefined,
        lng: values.lng !== undefined ? Number(values.lng) : undefined,
        requireDeposit: values.requireDeposit,
        depositType: values.requireDeposit ? values.depositType : undefined,
        depositValue:
          values.requireDeposit && values.depositValue !== undefined
            ? Number(values.depositValue)
            : undefined,
      }

      if (isEditing && fieldId) {
        await updateField(fieldId, payload)
        messageApi.success('Cập nhật thông tin cụm sân thành công!')
      } else {
        await createField(payload)
        messageApi.success('Tạo cụm sân mới thành công! Hồ sơ đang được kiểm duyệt.')
      }

      setTimeout(() => {
        navigate('/owner/fields')
      }, 700)
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu thông tin cụm sân.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="owner-page offp-wrapper">
      {contextHolder}

      {/* Top Breadcrumb */}
      <div className="offp-top-bar">
        <div className="offp-breadcrumb">
          <Link to="/owner/fields">Sân của tôi</Link>
          <span>/</span>
          <span className="offp-breadcrumb-current">
            {isEditing ? 'Chỉnh sửa sân' : 'Thêm sân mới'}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="offp-header">
        <div className="offp-header-left">
          <div className="offp-header-icon">
            <EnvironmentOutlined />
          </div>
          <div>
            <h1 className="offp-title">
              {isEditing ? 'Chỉnh sửa sân thể thao' : 'Thêm sân thể thao mới'}
            </h1>
            <p className="offp-subtitle">
              Cấu hình thông tin chi tiết, tọa độ vị trí và chính sách đặt cọc sân bóng.
            </p>
          </div>
        </div>
        <div className="offp-header-actions">
          {isEditing && fieldId && (
            <>
              <button
                type="button"
                className="offp-btn-secondary"
                onClick={() => navigate(`/owner/fields/${fieldId}/courts`)}
              >
                <AppstoreOutlined />
                <span>Quản lý sân con</span>
              </button>
              <button
                type="button"
                className="offp-btn-secondary"
                onClick={() => navigate(`/owner/fields/${fieldId}/images`)}
              >
                <PictureOutlined />
                <span>Hình ảnh</span>
              </button>
              <button
                type="button"
                className="offp-btn-secondary"
                onClick={() => navigate(`/owner/fields/${fieldId}/pricing`)}
              >
                <DollarOutlined />
                <span>Bảng giá</span>
              </button>
              <button
                type="button"
                className="offp-btn-secondary"
                onClick={() => navigate(`/owner/fields/${fieldId}/opening-hours`)}
              >
                <ClockCircleOutlined />
                <span>Giờ mở</span>
              </button>
              <button
                type="button"
                className="offp-btn-secondary"
                onClick={() => navigate(`/owner/fields/${fieldId}/services`)}
              >
                <ShoppingOutlined />
                <span>Dịch vụ</span>
              </button>
            </>
          )}
          <button
            type="button"
            className="offp-btn-secondary"
            onClick={() => navigate('/owner/fields')}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="offp-btn-primary"
            disabled={submitting}
            onClick={() => form.submit()}
          >
            <SaveOutlined />
            <span>{isEditing ? 'Lưu thay đổi' : 'Lưu sân mới'}</span>
          </button>
        </div>
      </div>

      {/* Two-Column Form & Visuals Grid */}
      <Form<FieldFormData>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: '',
          description: '',
          address: '',
          district: '',
          lat: 10.798123,
          lng: 106.654321,
          requireDeposit: false,
          depositType: 'fixed',
          depositValue: 100000,
        }}
      >
        <div className="offp-grid">
          {/* LEFT COLUMN: Input Form Cards */}
          <div className="offp-form-column">
            {/* Card 1: Basic Information */}
            <div className="offp-card">
              <div className="offp-card-header">
                <div className="offp-card-header-title">
                  <span className="offp-card-header-icon">
                    <EnvironmentOutlined />
                  </span>
                  <span>Thông tin sân</span>
                </div>
                <span className="offp-step-badge">Mục 1 / 3</span>
              </div>

              <div className="offp-field-group">
                <div className="offp-field-label-row">
                  <label htmlFor="field_name_input" className="offp-field-label">
                    <span>Tên sân thể thao</span>
                    <span className="offp-badge-required">BẮT BUỘC</span>
                  </label>
                  <span className="offp-char-count">{watchedName.length} / 255</span>
                </div>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên cụm sân thể thao.' },
                    { max: 255, message: 'Tên sân không được vượt quá 255 ký tự.' },
                  ]}
                >
                  <Input
                    id="field_name_input"
                    className="offp-input-dark"
                    placeholder="Ví dụ: Sân bóng Tân Bình Sport Complex"
                    maxLength={255}
                  />
                </Form.Item>
              </div>

              <div className="offp-field-group">
                <div className="offp-field-label-row">
                  <label htmlFor="field_desc_input" className="offp-field-label">
                    <span>Mô tả sân</span>
                    <span className="offp-badge-optional">(Tùy chọn)</span>
                  </label>
                  <span className="offp-char-count">{watchedDesc.length} / 500</span>
                </div>
                <Form.Item
                  name="description"
                  rules={[{ max: 500, message: 'Mô tả không được vượt quá 500 ký tự.' }]}
                >
                  <Input.TextArea
                    id="field_desc_input"
                    className="offp-textarea-dark"
                    rows={4}
                    placeholder="Mô tả đặc điểm mặt cỏ, hệ thống chiếu sáng, dịch vụ tiện ích..."
                    maxLength={500}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Card 2: Address & GPS */}
            <div className="offp-card">
              <div className="offp-card-header">
                <div className="offp-card-header-title">
                  <span className="offp-card-header-icon">
                    <CompassOutlined />
                  </span>
                  <span>Địa chỉ & Tọa độ GPS</span>
                </div>
                <span className="offp-step-badge">Mục 2 / 3</span>
              </div>

              <div className="offp-field-group">
                <div className="offp-field-label-row">
                  <label htmlFor="field_address_input" className="offp-field-label">
                    <span>Địa chỉ chi tiết</span>
                    <span className="offp-badge-required">BẮT BUỘC</span>
                  </label>
                </div>
                <Form.Item
                  name="address"
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ cụ thể của cụm sân.' },
                    { max: 255, message: 'Địa chỉ không được vượt quá 255 ký tự.' },
                  ]}
                >
                  <Input
                    id="field_address_input"
                    className="offp-input-dark"
                    placeholder="Ví dụ: 120 Hoàng Hoa Thám, Phường 12"
                    maxLength={255}
                  />
                </Form.Item>
              </div>

              <div className="offp-field-group">
                <div className="offp-field-label-row">
                  <label htmlFor="field_district_input" className="offp-field-label">
                    <span>Quận / Huyện</span>
                    <span className="offp-badge-optional">(Tùy chọn)</span>
                  </label>
                </div>
                <Form.Item
                  name="district"
                  rules={[{ max: 100, message: 'Quận/huyện không vượt quá 100 ký tự.' }]}
                >
                  <Input
                    id="field_district_input"
                    className="offp-input-dark"
                    placeholder="Ví dụ: Tân Bình"
                    maxLength={100}
                  />
                </Form.Item>
              </div>

              {/* GPS Coordinates Sub-Box */}
              <div className="offp-gps-box">
                <div className="offp-gps-header">
                  <div className="offp-gps-title">
                    <AimOutlined style={{ color: 'var(--lime)' }} />
                    <span>Tọa độ GPS định vị</span>
                  </div>
                  <div className="offp-gps-actions">
                    <button
                      type="button"
                      className="offp-btn-tool"
                      onClick={handleGetCurrentLocation}
                    >
                      <AimOutlined />
                      <span>Lấy vị trí hiện tại</span>
                    </button>
                    <button
                      type="button"
                      className="offp-btn-tool"
                      onClick={() => mapPreview.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
                    >
                      <EnvironmentOutlined />
                      <span>Ghim trên bản đồ</span>
                    </button>
                  </div>
                </div>

                <div className="offp-gps-inputs">
                  <div>
                    <div className="offp-field-label-row">
                      <label htmlFor="field_lat_input" className="offp-field-label">Vĩ độ</label>
                      <span className="offp-badge-optional">-90 đến 90</span>
                    </div>
                    <Form.Item
                      name="lat"
                      rules={[
                        {
                          type: 'number',
                          min: -90,
                          max: 90,
                          message: 'Vĩ độ phải nằm trong khoảng -90 đến 90.',
                        },
                      ]}
                    >
                      <InputNumber
                        id="field_lat_input"
                        className="offp-input-dark"
                        style={{ width: '100%' }}
                        step={0.000001}
                        addonAfter="° N"
                        placeholder="10.798123"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <div className="offp-field-label-row">
                      <label htmlFor="field_lng_input" className="offp-field-label">Kinh độ</label>
                      <span className="offp-badge-optional">-180 đến 180</span>
                    </div>
                    <Form.Item
                      name="lng"
                      rules={[
                        {
                          type: 'number',
                          min: -180,
                          max: 180,
                          message: 'Kinh độ phải nằm trong khoảng -180 đến 180.',
                        },
                      ]}
                    >
                      <InputNumber
                        id="field_lng_input"
                        className="offp-input-dark"
                        style={{ width: '100%' }}
                        step={0.000001}
                        addonAfter="° E"
                        placeholder="106.654321"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Deposit Policy */}
            <div className="offp-card">
              <div className="offp-card-header">
                <div className="offp-card-header-title">
                  <span className="offp-card-header-icon">
                    <DollarCircleOutlined />
                  </span>
                  <span>Chính sách đặt cọc giữ sân</span>
                </div>
                <span className="offp-step-badge">Mục 3 / 3</span>
              </div>

              {/* Require Deposit Toggle */}
              <div className="offp-deposit-toggle-row">
                <div className="offp-deposit-info">
                  <div className="offp-deposit-title-wrap">
                    <b style={{ color: 'var(--white)' }}>Yêu cầu đặt cọc trước</b>
                    <span className="offp-badge-recommended">Khuyên dùng</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--sage)' }}>
                    Khách hàng phải thanh toán tiền cọc để xác nhận lịch đặt tránh tình trạng hủy sân
                    giờ chót.
                  </span>
                </div>
                <Form.Item name="requireDeposit" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>

              {/* Conditional Sub-Panel */}
              {watchedRequireDeposit && (
                <div style={{ marginTop: 16 }}>
                  {/* Deposit Type */}
                  <div className="offp-field-group">
                    <label className="offp-field-label" style={{ marginBottom: 8 }}>
                      Hình thức đặt cọc
                    </label>
                    <Form.Item name="depositType" noStyle>
                      <div className="offp-deposit-type-grid">
                        <div
                          className={`offp-type-card ${watchedDepositType === 'fixed' ? 'active' : ''}`}
                          onClick={() => form.setFieldValue('depositType', 'fixed')}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="offp-type-card-left">
                            <span className="offp-type-icon">
                              <DollarCircleOutlined />
                            </span>
                            <div>
                              <b style={{ display: 'block', color: 'var(--white)', fontSize: 13 }}>
                                Số tiền cố định
                              </b>
                              <span style={{ fontSize: 11, color: 'var(--sage)' }}>
                                Thu cố định mỗi khung giờ
                              </span>
                            </div>
                          </div>
                          {watchedDepositType === 'fixed' && (
                            <CheckCircleFilled style={{ color: 'var(--lime)' }} />
                          )}
                        </div>

                        <div
                          className={`offp-type-card ${watchedDepositType === 'percentage' ? 'active' : ''}`}
                          onClick={() => form.setFieldValue('depositType', 'percentage')}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="offp-type-card-left">
                            <span className="offp-type-icon">
                              <PercentageOutlined />
                            </span>
                            <div>
                              <b style={{ display: 'block', color: 'var(--white)', fontSize: 13 }}>
                                Theo phần trăm (%)
                              </b>
                              <span style={{ fontSize: 11, color: 'var(--sage)' }}>
                                Tùy biến theo tổng hóa đơn
                              </span>
                            </div>
                          </div>
                          {watchedDepositType === 'percentage' && (
                            <CheckCircleFilled style={{ color: 'var(--lime)' }} />
                          )}
                        </div>
                      </div>
                    </Form.Item>
                  </div>

                  {/* Deposit Value */}
                  <div className="offp-field-group">
                    <div className="offp-field-label-row">
                      <label htmlFor="field_deposit_val" className="offp-field-label">
                        <span>Giá trị tiền cọc</span>
                      </label>
                      <span style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 600 }}>
                        {watchedDepositType === 'fixed' ? 'Tối thiểu: 0₫' : 'Tối thiểu: 0%'}
                      </span>
                    </div>
                    <Form.Item
                      name="depositValue"
                      rules={[
                        { required: true, message: 'Vui lòng nhập giá trị đặt cọc.' },
                        {
                          type: 'number',
                          min: 0,
                          max: watchedDepositType === 'percentage' ? 100 : 100000000,
                          message:
                            watchedDepositType === 'percentage'
                              ? 'Phần trăm phải từ 0% đến 100%.'
                              : 'Giá trị cọc phải từ 0₫ trở lên.',
                        },
                      ]}
                    >
                      <InputNumber
                        id="field_deposit_val"
                        className="offp-input-dark"
                        style={{ width: '100%', fontSize: 16, fontWeight: 700 }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                        addonAfter={watchedDepositType === 'fixed' ? '₫' : '%'}
                      />
                    </Form.Item>

                    {/* Quick Presets */}
                    <div className="offp-quick-presets">
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Mức cọc nhanh:</span>
                      <button
                        type="button"
                        className={`offp-preset-btn ${watchedDepositType === 'fixed' && watchedDepositValue === 50000 ? 'active' : ''}`}
                        onClick={() => handleSelectPreset(50000, 'fixed')}
                      >
                        50.000đ
                      </button>
                      <button
                        type="button"
                        className={`offp-preset-btn ${watchedDepositType === 'fixed' && watchedDepositValue === 100000 ? 'active' : ''}`}
                        onClick={() => handleSelectPreset(100000, 'fixed')}
                      >
                        100.000đ
                      </button>
                      <button
                        type="button"
                        className={`offp-preset-btn ${watchedDepositType === 'fixed' && watchedDepositValue === 200000 ? 'active' : ''}`}
                        onClick={() => handleSelectPreset(200000, 'fixed')}
                      >
                        200.000đ
                      </button>
                      <button
                        type="button"
                        className={`offp-preset-btn ${watchedDepositType === 'percentage' && watchedDepositValue === 50 ? 'active' : ''}`}
                        onClick={() => handleSelectPreset(50, 'percentage')}
                      >
                        50%
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Map & Guidelines */}
          <div className="offp-preview-column">
            {/* Card 1: Interactive Map Preview */}
            <div className="offp-card">
              <div className="offp-card-header">
                <div className="offp-card-header-title">
                  <EnvironmentOutlined className="offp-card-header-icon" />
                  <span>{t('owner.mapPreview.title')}</span>
                </div>
                <Segmented
                  size="small"
                  value={satellite ? 'satellite' : 'map'}
                  onChange={(value) => setSatellite(value === 'satellite')}
                  options={[
                    { value: 'map', label: t('owner.mapPreview.map') },
                    { value: 'satellite', label: t('owner.mapPreview.satellite') },
                  ]}
                />
              </div>
              <div className="offp-map-container" ref={mapPreview}>
                <iframe
                  title={t('owner.mapPreview.title')}
                  src={`https://maps.google.com/maps?q=${Number(watchedLat)},${Number(watchedLng)}&z=16&t=${satellite ? 'k' : 'm'}&output=embed`}
                  loading="lazy"
                />
              </div>
              <p className="offp-map-help">{t('owner.mapPreview.help')}</p>
            </div>

            {/* Card 2: Guidelines & Notes */}
            <div className="offp-card">
              <div className="offp-card-header">
                <div className="offp-card-header-title">
                  <InfoCircleOutlined className="offp-card-header-icon" />
                  <span>QUY ĐỊNH & LƯU Ý QUẢN LÝ</span>
                </div>
              </div>
              <div className="offp-guidelines-list">
                <div className="offp-guideline-item">
                  <span className="offp-guideline-bullet">•</span>
                  <span>
                    Tên sân và Địa chỉ chi tiết là các thông tin bắt buộc để người chơi tìm kiếm và
                    đặt lịch.
                  </span>
                </div>
                <div className="offp-guideline-item">
                  <span className="offp-guideline-bullet">•</span>
                  <span>
                    Khi kích hoạt đặt cọc, vui lòng chọn hình thức (cố định hoặc phần trăm) và giá
                    trị cọc hợp lệ.
                  </span>
                </div>
                <div className="offp-guideline-item">
                  <span className="offp-guideline-bullet">•</span>
                  <span>
                    Tọa độ GPS giúp ứng dụng khách hàng định vị chính xác vị trí sân trên bản đồ di
                    động.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>

      {/* Sticky Bottom Action Bar */}
      <aside className="offp-bottom-bar">
        <div className="offp-bottom-bar-inner">
          <button
            type="button"
            className="offp-btn-secondary"
            onClick={() => navigate('/owner/fields')}
          >
            Hủy bỏ
          </button>
          <button type="button" className="offp-btn-secondary" onClick={handleSaveDraft}>
            Lưu bản nháp
          </button>
          <button
            type="button"
            className="offp-btn-primary"
            disabled={submitting}
            onClick={() => form.submit()}
          >
            <PlusOutlined />
            <span>{isEditing ? 'Lưu thay đổi' : 'Tạo sân mới'}</span>
          </button>
        </div>
      </aside>
    </section>
  )
}
