import {
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Spin,
  Tag,
  TimePicker,
  message,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../../fields/field.data'
import { useOwnerPricing } from '../hooks/useOwnerPricing'
import type {
  CourtType,
  CreatePricingPayload,
  DayType,
  FieldPricingItem,
  UpdatePricingPayload,
} from '../interface/owner-field.types'
import './OwnerPricingManager.css'

export interface OwnerPricingManagerProps {
  fieldId: string
  fieldName?: string
}

interface PricingFormData {
  courtType: CourtType
  dayType: DayType
  timeRange: [Dayjs, Dayjs]
  price: number
}

interface CalcFormData {
  courtType: string
  date: Dayjs
  timeRange: [Dayjs, Dayjs]
}

export function OwnerPricingManager({ fieldId }: OwnerPricingManagerProps) {
  const { t } = useTranslation()
  const {
    pricingList,
    loading,
    error,
    loadPricing,
    createPricing,
    updatePricing,
    deletePricing,
    quoteResult,
    calculatingQuote,
    quoteError,
    calculateQuote,
    availabilityResult,
    checkingAvailability,
    availabilityError,
    checkAvailability,
  } = useOwnerPricing(fieldId)

  // Filters
  const [filterCourtType, setFilterCourtType] = useState<string>('all')
  const [filterDayType, setFilterDayType] = useState<string>('all')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<FieldPricingItem | null>(null)
  const [createForm] = Form.useForm<PricingFormData>()
  const [editForm] = Form.useForm<{ price: number; timeRange?: [Dayjs, Dayjs] }>()
  const [submitting, setSubmitting] = useState(false)

  // Calculator Form
  const [calcForm] = Form.useForm<CalcFormData>()

  const handleFilterChange = (courtVal: string, dayVal: string) => {
    void loadPricing({
      courtType: courtVal === 'all' ? undefined : courtVal,
      dayType: dayVal === 'all' ? undefined : dayVal,
    })
  }

  // Handle Create Pricing (POST /owner/fields/:fieldId/pricing)
  const handleCreateSubmit = async (values: PricingFormData) => {
    try {
      setSubmitting(true)
      const payload: CreatePricingPayload = {
        courtType: values.courtType,
        dayType: values.dayType,
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        price: Number(values.price),
      }

      await createPricing(payload)
      message.success('Đã thêm quy tắc bảng giá mới thành công!')
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response
          ?.data?.error?.message ||
        (err instanceof Error ? err.message : 'Lỗi khi tạo quy tắc giá')

      if (errorMsg.includes('PRICING_SLOT_OVERLAP') || errorMsg.includes('chồng chéo')) {
        message.error('Khung giờ này bị trùng lặp với quy tắc giá đã có cùng loại sân và ngày!')
      } else {
        message.error(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Edit Submit (PATCH /owner/fields/:fieldId/pricing/:pricingId)
  const handleEditSubmit = async (values: { price: number; timeRange?: [Dayjs, Dayjs] }) => {
    if (!editingPricing) return
    try {
      setSubmitting(true)
      const payload: UpdatePricingPayload = {
        price: Number(values.price),
      }
      if (values.timeRange) {
        payload.startTime = values.timeRange[0].format('HH:mm')
        payload.endTime = values.timeRange[1].format('HH:mm')
      }

      await updatePricing(editingPricing.id, payload)
      message.success('Đã cập nhật bảng giá thành công!')
      setEditingPricing(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật bảng giá'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete (DELETE /owner/fields/:fieldId/pricing/:pricingId)
  const handleDeletePricing = async (pricingId: string) => {
    try {
      await deletePricing(pricingId)
      message.success('Đã xóa quy tắc giá thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa quy tắc giá'
      message.error(msg)
    }
  }

  // Handle Calculate Quote (GET /fields/:fieldId/pricing/quote)
  const handleCalcQuote = async () => {
    try {
      const values = await calcForm.validateFields()
      await calculateQuote({
        courtType: values.courtType,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
      })
      message.success('Đã tính báo giá thành công!')
    } catch {
      // Ignored
    }
  }

  // Handle Check Availability (GET /fields/:fieldId/availability)
  const handleCheckAvail = async () => {
    try {
      const values = await calcForm.validateFields()
      await checkAvailability({
        courtType: values.courtType,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
      })
      message.success('Đã kiểm tra tình trạng trống!')
    } catch {
      // Ignored
    }
  }

  const renderDayTypeTag = (type: string) => {
    switch (type) {
      case 'weekday':
        return <Tag color="blue">Ngày thường (T2–T6)</Tag>
      case 'weekend':
        return <Tag color="green">Cuối tuần (T7–CN)</Tag>
      case 'holiday':
        return <Tag color="red">Ngày lễ</Tag>
      default:
        return <Tag>{type}</Tag>
    }
  }

  return (
    <div className="opm-container">
      {/* SECTION 1: Quản lý Bảng Giá */}
      <div className="opm-card">
        <div className="opm-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sage)' }}>
              <span>Loại sân:</span>
              <Select
                value={filterCourtType}
                style={{ width: 130 }}
                onChange={(val) => {
                  setFilterCourtType(val)
                  handleFilterChange(val, filterDayType)
                }}
                options={[
                  { value: 'all', label: 'Tất cả loại' },
                  { value: '5', label: 'Sân 5 người' },
                  { value: '7', label: 'Sân 7 người' },
                  { value: '11', label: 'Sân 11 người' },
                ]}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sage)' }}>
              <span>Loại ngày:</span>
              <Select
                value={filterDayType}
                style={{ width: 160 }}
                onChange={(val) => {
                  setFilterDayType(val)
                  handleFilterChange(filterCourtType, val)
                }}
                options={[
                  { value: 'all', label: 'Tất cả các ngày' },
                  { value: 'weekday', label: 'Ngày thường (T2–T6)' },
                  { value: 'weekend', label: 'Cuối tuần (T7–CN)' },
                  { value: 'holiday', label: 'Ngày lễ' },
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={() => handleFilterChange(filterCourtType, filterDayType)}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                createForm.resetFields()
                setCreateModalOpen(true)
              }}
            >
              Thêm khung giá mới
            </Button>
          </div>
        </div>

        {error && <Alert type="error" message={error} showIcon />}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 12, color: 'var(--sage)' }}>Đang tải bảng giá...</p>
          </div>
        ) : pricingList.length > 0 ? (
          <div className="opm-rules-grid">
            {pricingList.map((rule) => (
              <div className="opm-rule-card" key={rule.id}>
                <div>
                  <div className="opm-rule-head">
                    <Tag color="purple">Sân {rule.courtType} người</Tag>
                    {renderDayTypeTag(rule.dayType)}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <span className="opm-rule-price">{formatPrice(rule.price)}</span>
                    <small style={{ color: 'var(--sage)' }}> {t('booking.flow.perSlot')}</small>
                  </div>

                  <div className="opm-rule-time" style={{ marginTop: 8 }}>
                    <ClockCircleOutlined style={{ color: 'var(--lime)' }} />
                    <span>
                      {rule.startTime} – {rule.endTime}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingPricing(rule)
                      editForm.setFieldsValue({
                        price: rule.price,
                        timeRange: [dayjs(rule.startTime, 'HH:mm'), dayjs(rule.endTime, 'HH:mm')],
                      })
                    }}
                  >
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xóa quy tắc giá này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDeletePricing(rule.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="Chưa có quy tắc giá nào theo bộ lọc. Hãy tạo khung giá đầu tiên!" />
        )}
      </div>

      {/* SECTION 2: Công cụ Tính Báo Giá & Kiểm Tra Sân Trống Tức Thời */}
      <div className="opm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalculatorOutlined style={{ color: 'var(--lime)', fontSize: 18 }} />
          <div>
            <h3 style={{ color: 'var(--white)', margin: 0, fontSize: 16 }}>
              Công cụ tính báo giá & kiểm tra tình trạng trống (Quote & Availability)
            </h3>
            <span style={{ fontSize: 12, color: 'var(--sage)' }}>
              Mô phỏng tức thời thuật toán tính giá theo khung giờ và thuật toán kiểm tra khả dụng chống chồng chéo.
            </span>
          </div>
        </div>

        <div className="opm-calc-box">
          <Form
            form={calcForm}
            layout="inline"
            initialValues={{
              courtType: '5',
              date: dayjs(),
              timeRange: [dayjs('08:00', 'HH:mm'), dayjs('10:00', 'HH:mm')],
            }}
          >
            <Form.Item name="courtType" label="Loại sân">
              <Select
                style={{ width: 130 }}
                options={[
                  { value: '5', label: 'Sân 5' },
                  { value: '7', label: 'Sân 7' },
                  { value: '11', label: 'Sân 11' },
                ]}
              />
            </Form.Item>

            <Form.Item name="date" label="Ngày kiểm tra">
              <DatePicker format="DD/MM/YYYY" style={{ width: 140 }} />
            </Form.Item>

            <Form.Item name="timeRange" label="Khung giờ">
              <TimePicker.RangePicker format="HH:mm" minuteStep={15} style={{ width: 180 }} />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  loading={calculatingQuote}
                  onClick={handleCalcQuote}
                >
                  Tính báo giá
                </Button>
                <Button
                  icon={<CheckCircleOutlined />}
                  loading={checkingAvailability}
                  onClick={handleCheckAvail}
                >
                  Kiểm tra sân trống
                </Button>
              </div>
            </Form.Item>
          </Form>

          {/* Quote Result */}
          {quoteError && <Alert type="error" message={quoteError} showIcon />}
          {quoteResult && (
            <div className="opm-calc-result">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--white)' }}>
                  Báo giá ước tính ({quoteResult.courtType} người · {quoteResult.dayType}):
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--lime)' }}>
                  {formatPrice(quoteResult.totalPrice)}
                </span>
              </div>
              {quoteResult.breakdown.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12.5,
                    color: 'var(--sage)',
                    padding: '4px 0',
                    borderTop: '1px dashed var(--border-soft)',
                  }}
                >
                  <span>
                    Khung {b.startTime} – {b.endTime}: {formatPrice(b.slotPrice)}
                  </span>
                  <strong style={{ color: 'var(--white)' }}>{formatPrice(b.subtotal)}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Availability Result */}
          {availabilityError && <Alert type="error" message={availabilityError} showIcon />}
          {availabilityResult && (
            <div className="opm-calc-result">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {availabilityResult.isOpen !== false ? (
                  <CheckCircleOutlined style={{ color: 'var(--lime)', fontSize: 18 }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                )}
                <span style={{ fontWeight: 700, color: 'var(--white)' }}>
                  {availabilityResult.isOpen === false
                    ? 'Cụm sân đang đóng cửa trong khung giờ này.'
                    : 'Tình trạng khả dụng sân con:'}
                </span>
              </div>

              {availabilityResult.courtTypes?.map((ct) => (
                <div
                  key={ct.type}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                    padding: '6px 0',
                  }}
                >
                  <Tag color="blue">Sân {ct.type} người</Tag>
                  <span style={{ color: ct.isAvailable ? 'var(--lime)' : 'var(--muted)' }}>
                    {ct.isAvailable
                      ? `Còn trống ${ct.availableCourtsCount} / ${ct.totalCourtsCount} sân`
                      : 'Hết sân trống trong khung giờ này'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Tạo quy tắc giá mới (POST /owner/fields/:fieldId/pricing) */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        title="Thêm quy tắc bảng giá mới (Pricing - PRICE-01)"
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        okText="Tạo khung giá"
        cancelText="Hủy"
        className="opm-modal"
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
          initialValues={{
            courtType: '5',
            dayType: 'weekday',
            price: 200000,
            timeRange: [dayjs('06:00', 'HH:mm'), dayjs('17:00', 'HH:mm')],
          }}
        >
          <Form.Item name="courtType" label="Loại sân" rules={[{ required: true }]}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="5">Sân 5 người</Radio.Button>
              <Radio.Button value="7">Sân 7 người</Radio.Button>
              <Radio.Button value="11">Sân 11 người</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="dayType" label="Loại ngày áp dụng" rules={[{ required: true }]}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="weekday">Ngày thường (T2–T6)</Radio.Button>
              <Radio.Button value="weekend">Cuối tuần (T7–CN)</Radio.Button>
              <Radio.Button value="holiday">Ngày lễ</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Khung giờ áp dụng (Từ - Đến)"
            rules={[{ required: true, message: 'Chọn khung giờ' }]}
          >
            <TimePicker.RangePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Đơn giá mỗi giờ (VND)"
            rules={[{ required: true, message: 'Nhập đơn giá' }]}
          >
            <InputNumber min={0} step={20000} style={{ width: '100%' }} addonAfter={t('booking.flow.vndPerSlot')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Cập nhật quy tắc giá (PATCH /owner/fields/:fieldId/pricing/:pricingId) */}
      <Modal
        open={Boolean(editingPricing)}
        onCancel={() => setEditingPricing(null)}
        title="Chỉnh sửa khung giá"
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        className="opm-modal"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="timeRange" label="Khung giờ áp dụng">
            <TimePicker.RangePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Đơn giá mỗi giờ (VND)"
            rules={[{ required: true, message: 'Nhập đơn giá' }]}
          >
            <InputNumber min={0} step={20000} style={{ width: '100%' }} addonAfter={t('booking.flow.vndPerSlot')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
