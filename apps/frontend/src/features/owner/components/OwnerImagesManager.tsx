import { useTranslation } from 'react-i18next'
import { useUploadImage } from '../../../hooks/useUploadImage'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Spin,
  Switch,
  Upload,
  Tag,
  Tooltip,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useOwnerImages } from '../hooks/useOwnerImages'
import type {
  CreateImagePayload,
  OwnerImageItem,
  UpdateImagePayload,
} from '../interface/owner-field.types'
import './OwnerImagesManager.css'

export interface OwnerImagesManagerProps {
  fieldId: string
  fieldName?: string
}

const SAMPLE_PITCH_IMAGES = [
  'https://images.unsplash.com/photo-1529900240041-22f1ae4d6821?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
]

export function OwnerImagesManager({ fieldId }: OwnerImagesManagerProps) {
  const { t } = useTranslation()
  const imageUpload = useUploadImage()
  const {
    images,
    loading,
    error,
    loadImages,
    addImage,
    updateImage,
    deleteImage,
  } = useOwnerImages(fieldId)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<OwnerImageItem | null>(null)

  const [addForm] = Form.useForm<CreateImagePayload>()
  const [editForm] = Form.useForm<UpdateImagePayload>()
  const [submitting, setSubmitting] = useState(false)

  // Handle Add Image (POST /owner/fields/:fieldId/images)
  const handleAddSubmit = async (values: CreateImagePayload) => {
    try {
      setSubmitting(true)
      let url = values.url?.trim()
      if (imageUpload.file) {
        const uploaded = await imageUpload.upload()
        if (!uploaded) return
        url = uploaded.url
        addForm.setFieldValue('url', url)
      }
      if (!url) return

      await addImage({
        url,
        displayOrder: Number(values.displayOrder ?? 0),
        isThumbnail: Boolean(values.isThumbnail),
      })
      message.success('Đã tải hình ảnh lên cụm sân thành công!')
      setAddModalOpen(false)
      addForm.resetFields()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi thêm hình ảnh'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Open Edit
  const handleOpenEdit = (img: OwnerImageItem) => {
    setEditingImage(img)
    editForm.setFieldsValue({
      displayOrder: img.displayOrder,
      isThumbnail: img.isThumbnail,
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit (PATCH /owner/fields/:fieldId/images/:imageId)
  const handleEditSubmit = async (values: UpdateImagePayload) => {
    if (!editingImage) return
    try {
      setSubmitting(true)
      await updateImage(editingImage.id, {
        displayOrder: Number(values.displayOrder ?? 0),
        isThumbnail: Boolean(values.isThumbnail),
      })
      message.success('Đã cập nhật hình ảnh thành công!')
      setEditModalOpen(false)
      setEditingImage(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật hình ảnh'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Quick Set Thumbnail
  const handleSetThumbnail = async (img: OwnerImageItem) => {
    try {
      await updateImage(img.id, { isThumbnail: true })
      message.success(`Đã đặt ảnh làm thumbnail đại diện của cụm sân!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật ảnh đại diện'
      message.error(msg)
    }
  }

  // Handle Delete Image (DELETE /owner/fields/:fieldId/images/:imageId)
  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(imageId)
      message.success('Đã xóa hình ảnh khỏi cụm sân.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa hình ảnh'
      message.error(msg)
    }
  }

  return (
    <div className="oim-container">
      {/* Toolbar */}
      <div className="oim-toolbar">
        <div>
          <span style={{ fontSize: 13, color: 'var(--sage)' }}>
            Tổng số: <strong style={{ color: 'var(--lime)' }}>{images.length}</strong> hình ảnh
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => loadImages()}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              addForm.setFieldsValue({ displayOrder: images.length, isThumbnail: images.length === 0 })
              setAddModalOpen(true)
            }}
          >
            Thêm hình ảnh
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 12, color: 'var(--sage)' }}>Đang tải thư viện hình ảnh...</p>
        </div>
      ) : images.length > 0 ? (
        <Image.PreviewGroup>
          <div className="oim-grid">
            {images.map((img) => (
              <div className={`oim-card ${img.isThumbnail ? 'is-thumbnail' : ''}`} key={img.id}>
                <div className="oim-img-wrapper">
                  <Image src={img.url} alt="Field preview" fallback="/placeholder-field.jpg" />
                  <span className="oim-badge-order">Thứ tự: #{img.displayOrder}</span>
                  {img.isThumbnail && (
                    <span className="oim-badge-thumb">
                      <StarFilled /> Ảnh đại diện
                    </span>
                  )}
                </div>

                <div className="oim-card-body">
                  <div className="oim-card-meta">
                    <span>{img.createdAt ? dayjs(img.createdAt).format('DD/MM/YYYY') : ''}</span>
                    <Tooltip title="Mã ID hình ảnh">
                      <code style={{ fontSize: 11, color: 'var(--muted)' }}>{img.id.slice(0, 8)}...</code>
                    </Tooltip>
                  </div>

                  <div className="oim-card-actions">
                    {!img.isThumbnail ? (
                      <Button
                        size="small"
                        icon={<StarOutlined />}
                        onClick={() => handleSetThumbnail(img)}
                      >
                        Đặt đại diện
                      </Button>
                    ) : (
                      <Tag color="green">Đang làm đại diện</Tag>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(img)}
                      >
                        Sửa
                      </Button>
                      <Popconfirm
                        title="Xóa hình ảnh này?"
                        description="Hành động này sẽ gỡ vĩnh viễn ảnh khỏi cụm sân."
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDeleteImage(img.id)}
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      ) : (
        <Empty description="Cụm sân chưa có hình ảnh nào trong thư viện. Hãy tải lên ảnh đầu tiên để thu hút người đặt sân!" />
      )}

      {/* Modal 1: Thêm hình ảnh (POST /owner/fields/:fieldId/images) */}
      <Modal
        open={addModalOpen}
        onCancel={() => {
          if (submitting) return
          imageUpload.clearFile()
          setAddModalOpen(false)
        }}
        title="Thêm hình ảnh cụm sân (Images - FIELD-04)"
        onOk={() => addForm.submit()}
        confirmLoading={submitting}
        okText="Thêm ảnh"
        cancelText="Hủy"
        className="oim-modal"
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddSubmit}
          initialValues={{ displayOrder: 0, isThumbnail: false }}
        >
          <Form.Item
            name="url"
            label="Đường dẫn URL hình ảnh"
            rules={[
              { required: !imageUpload.file, message: t('owner.imageUrlRequired') },
              ...(imageUpload.file ? [] : [{ type: 'url' as const, message: t('owner.imageUrlInvalid') }]),
            ]}
          >
            <Input disabled={Boolean(imageUpload.file)} placeholder="https://example.com/pitch-image.jpg" />
          </Form.Item>

          <Upload
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={submitting}
            maxCount={1}
            fileList={imageUpload.file ? [{ uid: 'selected', name: imageUpload.file.name }] : []}
            beforeUpload={async (file) => {
              await imageUpload.selectFile(file)
              return Upload.LIST_IGNORE
            }}
            onRemove={() => imageUpload.clearFile()}
          >
            <Button disabled={submitting}>{t('owner.selectImageFile')}</Button>
          </Upload>

          <div>
            <span style={{ fontSize: 12, color: 'var(--sage)' }}>Ảnh mẫu gợi ý (click để chọn nhanh):</span>
            <div className="oim-sample-presets">
              {SAMPLE_PITCH_IMAGES.map((sampleUrl, idx) => (
                <div
                  key={idx}
                  className="oim-sample-preset-btn"
                  onClick={() => {
                    imageUpload.clearFile()
                    addForm.setFieldValue('url', sampleUrl)
                  }}
                  title={`Chọn ảnh mẫu #${idx + 1}`}
                >
                  <img src={sampleUrl} alt={`Sample ${idx}`} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <Form.Item name="displayOrder" label="Thứ tự hiển thị">
              <InputNumber min={0} max={999} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="isThumbnail" label="Ảnh đại diện (Thumbnail)" valuePropName="checked">
              <Switch checkedChildren="Thumbnail" unCheckedChildren="Thường" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal 2: Cập nhật hình ảnh (PATCH /owner/fields/:fieldId/images/:imageId) */}
      <Modal
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false)
          setEditingImage(null)
        }}
        title="Cập nhật thông tin hình ảnh"
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        className="oim-modal"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          {editingImage && (
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <img
                src={editingImage.url}
                alt="Preview"
                style={{ maxHeight: 160, borderRadius: 8, objectFit: 'cover' }}
              />
            </div>
          )}

          <Form.Item name="displayOrder" label="Thứ tự hiển thị (sắp xếp tăng dần)">
            <InputNumber min={0} max={999} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isThumbnail" label="Đặt làm ảnh đại diện chính (Thumbnail)" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
