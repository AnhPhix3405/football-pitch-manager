import { OwnerBlockedSlotsModal } from './OwnerBlockedSlotsModal'
import {
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Spin,
  Tag,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useOwnerCourts } from '../hooks/useOwnerCourts'
import type {
  CourtStatus,
  CourtType,
  CreateCourtPayload,
  OwnerCourtItem,
  UpdateCourtPayload,
} from '../interface/owner-field.types'
import './OwnerCourtsManager.css'

export interface OwnerCourtsManagerProps {
  fieldId: string
  fieldName?: string
}

export function OwnerCourtsManager({ fieldId }: OwnerCourtsManagerProps) {
  const {
    courts,
    loading,
    error,
    selectedCourt,
    loadingDetail,
    loadCourts,
    fetchCourtDetail,
    setSelectedCourt,
    createCourt,
    updateCourt,
    deleteCourt,
  } = useOwnerCourts(fieldId)

  // Filter state
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<OwnerCourtItem | null>(null)
  const [blockedModalCourt, setBlockedModalCourt] = useState<OwnerCourtItem | null>(null)

  const [createForm] = Form.useForm<CreateCourtPayload>()
  const [editForm] = Form.useForm<UpdateCourtPayload>()
  const [submitting, setSubmitting] = useState(false)

  const handleFilterChange = (typeVal: string, statusVal: string) => {
    const params = {
      type: typeVal === 'all' ? undefined : typeVal,
      status: statusVal === 'all' ? undefined : statusVal,
    }
    void loadCourts(params)
  }

  // Handle Create Court
  const handleCreateSubmit = async (values: CreateCourtPayload) => {
    try {
      setSubmitting(true)
      await createCourt({
        name: values.name.trim(),
        type: values.type,
        status: values.status || 'active',
      })
      message.success('Đã thêm sân con mới thành công!')
      setCreateModalOpen(false)
      createForm.resetFields()
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response
          ?.data?.error?.message ||
        (err instanceof Error ? err.message : 'Lỗi khi tạo sân con')

      if (errorMsg.includes('COURT_NAME_ALREADY_EXISTS') || errorMsg.includes('tồn tại')) {
        message.error('Tên sân con đã tồn tại trong cụm sân này. Vui lòng chọn tên khác!')
      } else {
        message.error(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Open Edit
  const handleOpenEdit = (court: OwnerCourtItem) => {
    setEditingCourt(court)
    editForm.setFieldsValue({
      name: court.name,
      type: court.type as CourtType,
      status: court.status as CourtStatus,
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (values: UpdateCourtPayload) => {
    if (!editingCourt) return
    try {
      setSubmitting(true)
      await updateCourt(editingCourt.id, {
        name: values.name?.trim(),
        type: values.type,
        status: values.status,
      })
      message.success('Đã cập nhật thông tin sân con thành công!')
      setEditModalOpen(false)
      setEditingCourt(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật sân con'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Open Detail
  const handleOpenDetail = async (courtId: string) => {
    setDetailModalOpen(true)
    await fetchCourtDetail(courtId)
  }

  // Handle Delete (Deactivate)
  const handleDeleteCourt = async (courtId: string) => {
    try {
      await deleteCourt(courtId)
      message.success('Đã vô hiệu hóa sân con thành công (chuyển sang inactive).')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi vô hiệu hóa sân con'
      message.error(msg)
    }
  }

  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Đang hoạt động</Tag>
      case 'maintenance':
        return <Tag color="orange">Đang bảo trì</Tag>
      case 'inactive':
        return <Tag color="default">Đã vô hiệu hóa</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const renderTypeTag = (type: string) => {
    switch (type) {
      case '5':
        return <Tag color="blue">Sân 5 người</Tag>
      case '7':
        return <Tag color="purple">Sân 7 người</Tag>
      case '11':
        return <Tag color="gold">Sân 11 người</Tag>
      default:
        return <Tag>Sân {type}</Tag>
    }
  }

  return (
    <div className="ocm-container">
      {/* Toolbar & Filters */}
      <div className="ocm-toolbar">
        <div className="ocm-filters">
          <div className="ocm-filter-group">
            <span>Loại sân:</span>
            <Select
              value={filterType}
              style={{ width: 130 }}
              onChange={(val) => {
                setFilterType(val)
                handleFilterChange(val, filterStatus)
              }}
              options={[
                { value: 'all', label: 'Tất cả loại' },
                { value: '5', label: 'Sân 5 người' },
                { value: '7', label: 'Sân 7 người' },
                { value: '11', label: 'Sân 11 người' },
              ]}
            />
          </div>

          <div className="ocm-filter-group">
            <span>Trạng thái:</span>
            <Select
              value={filterStatus}
              style={{ width: 145 }}
              onChange={(val) => {
                setFilterStatus(val)
                handleFilterChange(filterType, val)
              }}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'maintenance', label: 'Bảo trì' },
                { value: 'inactive', label: 'Đã vô hiệu hóa' },
              ]}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => handleFilterChange(filterType, filterStatus)}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Tạo sân con mới
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 12, color: 'var(--sage)' }}>Đang tải danh sách sân con...</p>
        </div>
      ) : courts.length > 0 ? (
        <div className="ocm-grid">
          {courts.map((court) => (
            <div className="ocm-card" key={court.id}>
              <div>
                <div className="ocm-card-head">
                  <h3 className="ocm-card-title">{court.name}</h3>
                  {renderStatusTag(court.status)}
                </div>
                <div className="ocm-card-badges">{renderTypeTag(court.type)}</div>
              </div>

              <div className="ocm-card-meta">
                <span>Cập nhật: {court.updatedAt ? dayjs(court.updatedAt).format('DD/MM/YYYY HH:mm') : 'N/A'}</span>
              </div>

              <div className="ocm-card-actions">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleOpenDetail(court.id)}
                >
                  Chi tiết
                </Button>
                <Button
                  size="small"
                  icon={<LockOutlined />}
                  onClick={() => setBlockedModalCourt(court)}
                >
                  Khóa lịch
                </Button>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenEdit(court)}
                >
                  Sửa
                </Button>
                {court.status !== 'inactive' && (
                  <Popconfirm
                    title="Vô hiệu hóa sân con?"
                    description="Sân con sẽ được chuyển sang trạng thái inactive."
                    okText="Đồng ý"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDeleteCourt(court.id)}
                  >
                    <Button size="small" danger icon={<StopOutlined />}>
                      Khóa
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty description="Cụm sân chưa có sân con nào theo bộ lọc đã chọn. Hãy tạo sân con đầu tiên!" />
      )}

      {/* Modal 1: Tạo sân con mới (POST /owner/fields/:fieldId/courts) */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        title="Tạo sân con mới (Courts - FIELD-03)"
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        okText="Tạo sân con"
        cancelText="Hủy"
        className="ocm-modal"
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit} initialValues={{ type: '5', status: 'active' }}>
          <Form.Item
            name="name"
            label="Tên sân con"
            rules={[{ required: true, message: 'Vui lòng nhập tên sân con (ví dụ: Sân 1, Sân A)' }]}
          >
            <Input placeholder="Ví dụ: Sân 1 (5 người)" maxLength={100} />
          </Form.Item>

          <Form.Item name="type" label="Loại sân" rules={[{ required: true }]}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="5">Sân 5 người</Radio.Button>
              <Radio.Button value="7">Sân 7 người</Radio.Button>
              <Radio.Button value="11">Sân 11 người</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái ban đầu">
            <Radio.Group>
              <Radio value="active">Đang hoạt động</Radio>
              <Radio value="maintenance">Bảo trì</Radio>
              <Radio value="inactive">Không hoạt động</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 2: Cập nhật sân con (PATCH /owner/fields/:fieldId/courts/:courtId) */}
      <Modal
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false)
          setEditingCourt(null)
        }}
        title={`Cập nhật sân con: ${editingCourt?.name || ''}`}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        className="ocm-modal"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="name"
            label="Tên sân con"
            rules={[{ required: true, message: 'Vui lòng nhập tên sân con' }]}
          >
            <Input placeholder="Tên sân con" maxLength={100} />
          </Form.Item>

          <Form.Item name="type" label="Loại sân">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="5">Sân 5</Radio.Button>
              <Radio.Button value="7">Sân 7</Radio.Button>
              <Radio.Button value="11">Sân 11</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Radio.Group>
              <Radio value="active">Đang hoạt động</Radio>
              <Radio value="maintenance">Bảo trì</Radio>
              <Radio value="inactive">Đã vô hiệu hóa</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal 3: Chi tiết sân con (GET /owner/fields/:fieldId/courts/:courtId) */}
      <Modal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false)
          setSelectedCourt(null)
        }}
        title="Chi tiết sân con"
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        className="ocm-modal"
        destroyOnClose
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin />
            <p style={{ marginTop: 8, color: 'var(--sage)' }}>Đang tải chi tiết...</p>
          </div>
        ) : selectedCourt ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--ground)', padding: 14, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--lime)', marginBottom: 8 }}>
                {selectedCourt.name}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {renderTypeTag(selectedCourt.type)}
                {renderStatusTag(selectedCourt.status)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--sage)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div><strong>Mã sân con (Court ID):</strong> <code style={{ color: 'var(--lime)' }}>{selectedCourt.id}</code></div>
                <div><strong>Mã cụm sân (Field ID):</strong> <code style={{ color: 'var(--sage)' }}>{selectedCourt.fieldId}</code></div>
                <div><strong>Thời điểm tạo:</strong> {selectedCourt.createdAt ? dayjs(selectedCourt.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}</div>
                <div><strong>Cập nhật gần nhất:</strong> {selectedCourt.updatedAt ? dayjs(selectedCourt.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}</div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {blockedModalCourt && (
        <OwnerBlockedSlotsModal
          open={Boolean(blockedModalCourt)}
          fieldId={fieldId}
          courtId={blockedModalCourt.id}
          courtName={blockedModalCourt.name}
          onClose={() => setBlockedModalCourt(null)}
        />
      )}
    </div>
  )
}
