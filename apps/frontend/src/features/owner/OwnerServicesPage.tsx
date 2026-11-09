import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      message.success(t('owner.servicePage.created'))
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response
          ?.data?.error?.message ||
        (err instanceof Error ? err.message : t('owner.servicePage.createError'))

      if (errorMsg.includes('SERVICE_NAME_ALREADY_EXISTS') || errorMsg.includes('trùng')) {
        message.error(t('owner.servicePage.duplicate'))
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
      message.success(t('owner.servicePage.updated'))
      setEditingService(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('owner.servicePage.editError')
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
        message.success(t('owner.servicePage.deactivated', { name: service.name }))
      } else {
        await updateService(service.id, { isActive: true })
        message.success(t('owner.servicePage.reactivated', { name: service.name }))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('owner.servicePage.toggleError')
      message.error(msg)
    }
  }

  return (
    <section className="owner-page osp-container" style={{ padding: '24px 0' }}>
      <header className="user-page__head">
        <div>
          <Breadcrumb
            items={[
              { title: <Link to="/owner/fields">{t('owner.servicePage.navFields')}</Link> },
              { title: currentField?.name || t('owner.servicePage.field') },
              { title: t('owner.servicePage.section') },
            ]}
            style={{ marginBottom: 8 }}
          />
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingOutlined style={{ color: 'var(--lime)' }} />
            {t('owner.servicePage.title')}
          </h1>
          <p>{t('owner.servicePage.description')}</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {paramFieldId && (
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/fields')}>
              {t('owner.servicePage.back')}
            </Button>
          )}
          <PillButton
            variant="primary"
            icon={<PlusOutlined />}
            text={t('owner.servicePage.add')}
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
            <span style={{ fontSize: 13, color: 'var(--sage)' }}>{t('owner.servicePage.fieldLabel')}</span>
            <Select
              value={selectedFieldId || undefined}
              placeholder={t('owner.servicePage.chooseField')}
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
            <span style={{ fontSize: 13, color: 'var(--sage)' }}>{t('owner.servicePage.statusLabel')}</span>
            <Select
              value={filterActive}
              style={{ width: 160 }}
              onChange={handleFilterChange}
              options={[
                { value: 'all', label: t('owner.servicePage.allStatuses') },
                { value: 'active', label: t('owner.servicePage.active') },
                { value: 'inactive', label: t('owner.servicePage.inactive') },
              ]}
            />
          </div>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => handleFilterChange(filterActive)}
        >
          {t('owner.servicePage.refresh')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      {/* Services Table */}
      <div className="osp-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 12, color: 'var(--sage)' }}>{t('owner.servicePage.loading')}</p>
          </div>
        ) : services.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={services}
            pagination={false}
            columns={[
              {
                title: t('owner.servicePage.nameHeader'),
                dataIndex: 'name',
                render: (val: string) => <strong style={{ color: 'var(--white)' }}>{val}</strong>,
              },
              {
                title: t('owner.servicePage.priceHeader'),
                render: (_, item) => (
                  <span style={{ color: 'var(--lime)', fontWeight: 600 }}>
                    {formatPrice(item.price)} <small style={{ color: 'var(--sage)' }}>/ {item.unit}</small>
                  </span>
                ),
              },
              {
                title: t('owner.servicePage.statusHeader'),
                render: (_, item) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Switch
                      checked={item.isActive}
                      onChange={(checked) => handleToggleActive(item, checked)}
                    />
                    <Tag color={item.isActive ? 'green' : 'default'}>
                      {item.isActive ? t('owner.servicePage.active') : t('owner.servicePage.inactive')}
                    </Tag>
                  </div>
                ),
              },
              {
                title: t('owner.servicePage.actions'),
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
                      {t('owner.servicePage.edit')}
                    </Button>

                    {item.isActive && (
                      <Popconfirm
                        title={t('owner.servicePage.disableConfirm')}
                        okText={t('owner.servicePage.disable')}
                        cancelText={t('owner.servicePage.cancel')}
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleToggleActive(item, false)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />}>
                          {t('owner.servicePage.disable')}
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <Empty description={t('owner.servicePage.empty')} />
        )}
      </div>

      {/* Modal 1: Tạo dịch vụ mới (POST /owner/fields/:fieldId/services) */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        title={t('owner.servicePage.createTitle')}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        okText={t('owner.servicePage.create')}
        cancelText={t('owner.servicePage.cancel')}
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
            label={t('owner.servicePage.name')}
            rules={[{ required: true, message: t('owner.servicePage.nameRequired') }]}
          >
            <Input placeholder={t('owner.servicePage.namePlaceholder')} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <Form.Item
              name="price"
              label={t('owner.servicePage.price')}
              rules={[{ required: true, message: t('owner.servicePage.priceRequired') }]}
            >
              <InputNumber min={0} step={5000} style={{ width: '100%' }} addonAfter="VND" />
            </Form.Item>

            <Form.Item
              name="unit"
              label={t('owner.servicePage.unit')}
              rules={[{ required: true, message: t('owner.servicePage.unitRequired') }]}
            >
              <Input placeholder={t('owner.servicePage.unitPlaceholder')} />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label={t('owner.servicePage.initialStatus')} valuePropName="checked">
            <Switch checkedChildren={t('owner.servicePage.enable')} unCheckedChildren={t('owner.servicePage.disable')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Cập nhật dịch vụ (PATCH /owner/fields/:fieldId/services/:serviceId) */}
      <Modal
        open={Boolean(editingService)}
        onCancel={() => setEditingService(null)}
        title={t('owner.servicePage.editTitle', { name: editingService?.name })}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        okText={t('owner.servicePage.save')}
        cancelText={t('owner.servicePage.cancel')}
        className="osp-modal"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="name"
            label={t('owner.servicePage.name')}
            rules={[{ required: true, message: t('owner.servicePage.nameRequired') }]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <Form.Item
              name="price"
              label={t('owner.servicePage.price')}
              rules={[{ required: true, message: t('owner.servicePage.priceRequired') }]}
            >
              <InputNumber min={0} step={5000} style={{ width: '100%' }} addonAfter="VND" />
            </Form.Item>

            <Form.Item name="unit" label={t('owner.servicePage.unit')}>
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label={t('owner.servicePage.active')} valuePropName="checked">
            <Switch checkedChildren={t('owner.servicePage.enable')} unCheckedChildren={t('owner.servicePage.disable')} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}
