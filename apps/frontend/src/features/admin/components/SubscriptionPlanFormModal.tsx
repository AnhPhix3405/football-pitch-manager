import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tag,
} from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_BENEFIT_SUGGESTIONS,
  DURATION_PRESETS,
} from '../constants/admin-subscription.constant'
import type {
  AdminSubscriptionPlan,
  CreateSubscriptionPlanPayload,
  UpdateSubscriptionPlanPayload,
} from '../interface/admin-subscription.interface'

interface SubscriptionPlanFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: AdminSubscriptionPlan | null
  onClose: () => void
  onSubmit: (
    payload: CreateSubscriptionPlanPayload | UpdateSubscriptionPlanPayload,
  ) => Promise<void>
  loading?: boolean
}

interface FormValues {
  name: string
  price: number
  durationDays: number
  features: string[]
  isActive: boolean
}

export function SubscriptionPlanFormModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  loading = false,
}: SubscriptionPlanFormModalProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm<FormValues>()

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        const feats =
          initialData.benefit && Array.isArray(initialData.benefit.features)
            ? (initialData.benefit.features as string[])
            : []
        form.setFieldsValue({
          name: initialData.name,
          price: Number(initialData.price) || 0,
          durationDays: initialData.durationDays,
          features: feats,
          isActive: initialData.isActive,
        })
      } else {
        form.setFieldsValue({
          name: '',
          price: 199000,
          durationDays: 30,
          features: [
            'Quản lý không giới hạn số lượng sân con',
            'Báo cáo doanh thu nâng cao',
          ],
          isActive: true,
        })
      }
    } else {
      form.resetFields()
    }
  }, [open, mode, initialData, form])

  const handleFinish = async (values: FormValues) => {
    const cleanFeatures = (values.features || []).filter(
      (f) => typeof f === 'string' && f.trim() !== '',
    )
    const payload = {
      name: values.name.trim(),
      price: values.price,
      durationDays: values.durationDays,
      benefit: {
        features: cleanFeatures,
      },
      isActive: values.isActive,
    }
    await onSubmit(payload)
  }

  const addSuggestion = (suggestion: string) => {
    const currentFeatures = form.getFieldValue('features') || []
    if (!currentFeatures.includes(suggestion)) {
      form.setFieldsValue({
        features: [...currentFeatures, suggestion],
      })
    }
  }

  return (
    <Modal
      title={
        mode === 'create'
          ? t('admin.createPlanTitle', { defaultValue: 'Thêm gói dịch vụ hội viên mới' })
          : t('admin.editPlanTitle', { defaultValue: 'Chỉnh sửa gói dịch vụ hội viên' })
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={mode === 'create' ? t('common.create', { defaultValue: 'Tạo gói' }) : t('common.save', { defaultValue: 'Lưu thay đổi' })}
      cancelText={t('common.cancel', { defaultValue: 'Hủy' })}
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label={t('admin.planName', { defaultValue: 'Tên gói dịch vụ' })}
          rules={[
            { required: true, message: t('admin.nameRequired', { defaultValue: 'Vui lòng nhập tên gói' }) },
            { max: 100, message: t('admin.nameMax', { defaultValue: 'Tối đa 100 ký tự' }) },
          ]}
        >
          <Input placeholder="Ví dụ: Gói Hội Viên Pro Facility" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="price"
            label={t('admin.planPrice', { defaultValue: 'Biểu giá (VND)' })}
            rules={[
              { required: true, message: t('admin.priceRequired', { defaultValue: 'Vui lòng nhập giá' }) },
            ]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              step={10000}
              formatter={(val) =>
                val !== undefined ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
              }
              parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0)}
            />
          </Form.Item>

          <Form.Item
            name="durationDays"
            label={t('admin.planDuration', { defaultValue: 'Thời hạn (Số ngày)' })}
            rules={[
              { required: true, message: t('admin.durationRequired', { defaultValue: 'Vui lòng chọn thời hạn' }) },
            ]}
          >
            <Select options={DURATION_PRESETS} />
          </Form.Item>
        </div>

        <Form.Item
          name="isActive"
          label={t('admin.planActiveStatus', { defaultValue: 'Trạng thái hoạt động' })}
          valuePropName="checked"
        >
          <Switch
            checkedChildren={t('admin.active', { defaultValue: 'Bật' })}
            unCheckedChildren={t('admin.inactive', { defaultValue: 'Tắt' })}
          />
        </Form.Item>

        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
            {t('admin.planBenefits', { defaultValue: 'Danh sách quyền lợi gói dịch vụ' })}:
          </span>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DEFAULT_BENEFIT_SUGGESTIONS.map((sugg, idx) => (
              <Tag
                key={idx}
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
                onClick={() => addSuggestion(sugg)}
              >
                + {sugg}
              </Tag>
            ))}
          </div>
        </div>

        <Form.List name="features">
          {(fields, { add, remove }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Form.Item
                    {...restField}
                    name={name}
                    style={{ margin: 0, flex: 1 }}
                    rules={[{ required: true, message: 'Nhập nội dung quyền lợi' }]}
                  >
                    <Input placeholder="Mô tả quyền lợi..." />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 4 }}
              >
                {t('admin.addBenefit', { defaultValue: 'Thêm dòng quyền lợi' })}
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
