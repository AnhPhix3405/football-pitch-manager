import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Breadcrumb,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Switch,
  Table,
  Tag,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PillButton } from '../../components/PillButton'
import { formatPrice } from '../fields/field.data'
import { useOwnerFields } from './hooks/useOwnerFields'
import { useOwnerServices } from './hooks/useOwnerServices'
import type {
  CreateServicePayload,
  OwnerServiceItem,
  UpdateServicePayload,
} from './interface/owner-field.types'
import './OwnerServicesPage.css'

export function OwnerServicesPage() {
  const { fieldId: paramFieldId } = useParams<{ fieldId?: string }>()
  const navigate = useNavigate()
  const { fields, loading: loadingFields } = useOwnerFields()

  const [selectedFieldId, setSelectedFieldId] = useState<string>(paramFieldId || '')

  useEffect(() => {
    if (paramFieldId) {
      setSelectedFieldId(paramFieldId)
    } else if (fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0].id)
    }
  }, [paramFieldId, fields, selectedFieldId])

  const { services, loading, error, loadServices, createService, updateService, deleteService } =
    useOwnerServices(selectedFieldId)

  // Filter
  const [filterActive, setFilterActive] = useState<string>('all')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<OwnerServiceItem | null>(null)
  const [createForm] = Form.useForm<CreateServicePayload>()
  const [editForm] = Form.useForm<UpdateServicePayload>()
  const [submitting, setSubmitting] = useState(false)

  const currentField = fields.find((f) => f.id === selectedFieldId)

  const handleFilterChange = (val: string) => {
    setFilterActive(val)
    const activeParam = val === 'all' ? undefined : val === 'active'
    void loadServices({ isActive: activeParam })
  }

  // Handle Create Service (POST /owner/fields/:fieldId/services)
  const handleCreateSubmit = async (values: CreateServicePayload) => {
    try {
      setSubmitting(true)
      await createService({
        name: values.name.trim(),
        price: Number(values.price),
        unit: values.unit?.trim() || 'lượt',
        isActive: values.isActive ?? true,
      })
      message.success('Đã tạo dịch vụ đi kèm mới thành công!')
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response
          ?.data?.error?.message ||
        (err instanceof Error ? err.message : 'Lỗi khi tạo dịch vụ')

      if (errorMsg.includes('SERVICE_NAME_ALREADY_EXISTS') || errorMsg.includes('trùng')) {
        message.error('Tên dịch vụ đã tồn tại trong cụm sân này. Vui lòng chọn tên khác!')
      } else {
        message.error(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Edit Submit (PATCH /owner/fields/:fieldId/services/:serviceId)
  const handleEditSubmit = async (values: UpdateServicePayload) => {
    if (!editingService) return
    try {
      setSubmitting(true)
      await updateService(editingService.id, {
        name: values.name?.trim(),
        price: values.price !== undefined ? Number(values.price) : undefined,
        unit: values.unit?.trim(),
        isActive: values.isActive,
      })
      message.success('Đã cập nhật dịch vụ thành công!')
      setEditingService(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật dịch vụ'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Toggle Active
  const handleToggleActive = async (service: OwnerServiceItem, checked: boolean) => {
    try {
      if (!checked) {
        // DELETE /owner/fields/:fieldId/services/:serviceId sets isActive = false
        await deleteService(service.id)
        message.success(`Đã tắt trạng thái hoạt động của dịch vụ "${service.name}".`)
      } else {
        await updateService(service.id, { isActive: true })
        message.success(`Đã bật lại dịch vụ "${service.name}".`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi thay đổi trạng thái dịch vụ'
      message.error(msg)
    }
  }

  return (
    <section className="owner-page osp-container" style={{ padding: '24px 0' }}>
      <header className="user-page__head">
        <div>
          <Breadcrumb
            items={[
              { title: <Link to="/owner/fields">Sân của tôi</Link> },
              { title: currentField?.name || 'Cụm sân' },
              { title: 'Dịch vụ đi kèm' },
            ]}
            style={{ marginBottom: 8 }}
          />
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingOutlined style={{ color: 'var(--lime)' }} />
            Quản lý dịch vụ đi kèm (Services - FIELD-05)
          </h1>
          <p>Cấu hình các tiện ích & dịch vụ bán kèm như bóng, áo bib, nước uống, trọng tài...</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {paramFieldId && (
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/fields')}>
              Quay lại
            </Button>
          )}
          <PillButton
            variant="primary"
            icon={<PlusOutlined />}
            text="Thêm dịch vụ"
            onClick={() => {
              createForm.resetFields()
              setCreateModalOpen(true)
            }}
          />
        </div>
      </header>

      {/* Toolbar: Field selector & Status filter */}
      <div className="osp-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--sage)' }}>Cụm sân:</span>
            <Select
              value={selectedFieldId || undefined}
              placeholder="Chọn cụm sân"
              onChange={(val) => {
                setSelectedFieldId(val)
                if (paramFieldId) navigate(`/owner/fields/${val}/services`)
              }}
              options={fields.map((f) => ({ value: f.id, label: f.name }))}
              loading={loadingFields}
              style={{ minWidth: 260 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--sage)' }}>Trạng thái:</span>
            <Select
              value={filterActive}
              style={{ width: 160 }}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Đã tạm ngưng' },
              ]}
            />
          </div>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => handleFilterChange(filterActive)}
        >
          Làm mới
        </Button>
      </div>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      {/* Services Table */}
      <div className="osp-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 12, color: 'var(--sage)' }}>Đang tải danh sách dịch vụ...</p>
          </div>
        ) : services.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={services}
            pagination={false}
            columns={[
              {
                title: 'TÊN DỊCH VỤ',
                dataIndex: 'name',
                render: (val: string) => <strong style={{ color: 'var(--white)' }}>{val}</strong>,
              },
              {
                title: 'ĐƠN GIÁ',
                render: (_, item) => (
                  <span style={{ color: 'var(--lime)', fontWeight: 600 }}>
                    {formatPrice(item.price)} <small style={{ color: 'var(--sage)' }}>/ {item.unit}</small>
                  </span>
                ),
              },
              {
                title: 'TRẠNG THÁI',
                render: (_, item) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Switch
                      checked={item.isActive}
                      onChange={(checked) => handleToggleActive(item, checked)}
                    />
                    <Tag color={item.isActive ? 'green' : 'default'}>
                      {item.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </Tag>
                  </div>
                ),
              },
              {
                title: 'THAO TÁC',
                align: 'right',
                render: (_, item) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingService(item)
                        editForm.setFieldsValue({
                          name: item.name,
                          price: item.price,
                          unit: item.unit,
                          isActive: item.isActive,
                        })
                      }}
                    >
                      Sửa
                    </Button>

                    {item.isActive && (
                      <Popconfirm
                        title="Tắt trạng thái hoạt động dịch vụ này?"
                        okText="Tắt"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleToggleActive(item, false)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                          Tắt
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <Empty description="Chưa có dịch vụ đi kèm nào cho cụm sân này. Hãy thêm dịch vụ đầu tiên!" />
        )}
      </div>

      {/* Modal 1: Tạo dịch vụ mới (POST /owner/fields/:fieldId/services) */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        title="Tạo dịch vụ đi kèm mới"
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        okText="Tạo dịch vụ"
        cancelText="Hủy"
        className="osp-modal"
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
          initialValues={{ price: 50000, unit: 'quả / trận', isActive: true }}
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
          >
            <Input placeholder="Ví dụ: Thuê bóng thi đấu, Áo bib, Nước khoáng..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <Form.Item
              name="price"
              label="Đơn giá (VND)"
              rules={[{ required: true, message: 'Nhập giá >= 0' }]}
            >
              <InputNumber min={0} step={5000} style={{ width: '100%' }} addonAfter="VND" />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Đơn vị tính"
              rules={[{ required: true, message: 'Nhập đơn vị' }]}
            >
              <Input placeholder="quả / trận, bộ, thùng..." />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label="Trạng thái hoạt động ban đầu" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Cập nhật dịch vụ (PATCH /owner/fields/:fieldId/services/:serviceId) */}
      <Modal
        open={Boolean(editingService)}
        onCancel={() => setEditingService(null)}
        title={`Chỉnh sửa dịch vụ: ${editingService?.name || ''}`}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        className="osp-modal"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <Form.Item
              name="price"
              label="Đơn giá (VND)"
              rules={[{ required: true, message: 'Nhập giá' }]}
            >
              <InputNumber min={0} step={5000} style={{ width: '100%' }} addonAfter="VND" />
            </Form.Item>

            <Form.Item name="unit" label="Đơn vị tính">
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}
